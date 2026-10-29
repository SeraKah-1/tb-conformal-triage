/* Dependency-free XLSX writer. Inline text cells never evaluate as formulas. */
(() => {
    'use strict';
    const utf8 = s => new TextEncoder().encode(s);
    const xml = value => String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const table = Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
    function crc(data){let n=0xffffffff;for(const b of data)n=table[(n^b)&255]^(n>>>8);return (n^0xffffffff)>>>0;}
    function header(size,values){const bytes=new Uint8Array(size),view=new DataView(bytes.buffer);for(const [offset,value,width] of values)width===2?view.setUint16(offset,value,true):view.setUint32(offset,value,true);return bytes;}
    function zip(files){
        const parts=[],central=[];let offset=0,total=0;
        for(const [path,text] of Object.entries(files)){
            const name=utf8(path),data=utf8(text),sum=crc(data);
            const local=header(30,[[0,0x04034b50,4],[4,20,2],[10,0,2],[12,33,2],[14,sum,4],[18,data.length,4],[22,data.length,4],[26,name.length,2]]);
            const entry=header(46,[[0,0x02014b50,4],[4,20,2],[6,20,2],[14,33,2],[16,sum,4],[20,data.length,4],[24,data.length,4],[28,name.length,2],[42,offset,4]]);
            parts.push(local,name,data);central.push(entry,name);offset+=local.length+name.length+data.length;total+=entry.length+name.length;
        }
        return new Blob([...parts,...central,header(22,[[0,0x06054b50,4],[8,central.length/2,2],[10,central.length/2,2],[12,total,4],[16,offset,4]])],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    }
    const column = i => {let s='';for(i++;i;i=Math.floor((i-1)/26))s=String.fromCharCode(65+(i-1)%26)+s;return s;};
    function xlsx(headers,rows){
        if([headers,...rows].some(row=>row.some(v=>String(v??'').length>32767)))throw new RangeError('Cell exceeds Excel limit');
        const all=[headers,...rows],end=column(headers.length-1)+all.length;
        const body=all.map((row,i)=>`<row r="${i+1}">${row.map((v,j)=>{const ref=column(j)+(i+1),style=i===0?1:0;if(i>0&&typeof v==='number'&&Number.isFinite(v))return `<c r="${ref}" s="2"><v>${v}</v></c>`;return `<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${xml(v)}</t></is></c>`;}).join('')}</row>`).join('');
        const widths=headers.map((_,i)=>`<col min="${i+1}" max="${i+1}" width="${i===1||i===headers.length-2?40:i===0?38:24}" customWidth="1"/>`).join('');
        return zip({
            '[Content_Types].xml':'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
            '_rels/.rels':'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
            'xl/workbook.xml':'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Results" sheetId="1" r:id="rId1"/></sheets></workbook>',
            'xl/_rels/workbook.xml.rels':'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
            'xl/styles.xml':'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF193349"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="3"><xf fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf fontId="1" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="10" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
            'xl/worksheets/sheet1.xml':`<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:${end}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${widths}</cols><sheetData>${body}</sheetData><autoFilter ref="A1:${end}"/></worksheet>`
        });
    }
    window.caseReports={xlsx};
})();
