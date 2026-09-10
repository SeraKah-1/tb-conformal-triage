from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ConformalTriageDetails(BaseModel):
    conformal_set: List[str] = Field(..., description="Classes included in the prediction set at alpha=0.05")
    quantile_q0_normal: float = Field(..., description="Calibrated quantile threshold for Normal class")
    quantile_q1_tb: float = Field(..., description="Calibrated quantile threshold for TB class")
    nominal_coverage_guarantee: str = Field(default=">= 95.0%", description="Nominal statistical coverage bound")
    clinical_action_code: str = Field(..., description="AUTO_RELEASE_NORMAL, ASSISTIVE_NORMAL_DOCTOR_VERIFY, AUTO_FLAG_TB_URGENT, or REFER_AMBIGUOUS_TO_DOCTOR")
    safety_interlock_engaged: bool = Field(..., description="True if autonomous release is overridden by safety guards")

class TriagePredictionResponse(BaseModel):
    filename: str
    predicted_class: str = Field(..., description="Tuberculosis or Normal")
    probability_tb: float = Field(..., description="Calibrated posterior probability of Tuberculosis")
    probability_normal: float = Field(..., description="Calibrated posterior probability of Normal")
    decision_threshold_used: float = Field(..., description="Operating threshold used for binary decision")
    triage_action: str = Field(..., description="Actionable clinical workflow directive")
    conformal_details: ConformalTriageDetails
    warning: Optional[str] = Field(default=None, description="Clinical safety advisory if deployed on uncalibrated hardware")
    iqa_report: Optional[Dict[str, Any]] = Field(default=None, description="Input Quality Assurance (IQA) radiographic evaluation")
    ood_report: Optional[Dict[str, Any]] = Field(default=None, description="Mahalanobis Out-Of-Distribution (OOD) distance evaluation")
    allow_autonomous_release: bool = Field(default=False, description="Operational configuration status for autonomous release")
    hirescam_heatmap_base64: Optional[str] = Field(default=None, description="Base64 PNG of HiResCAM anatomical overlay if requested")
    inference_latency_ms: float

class HealthResponse(BaseModel):
    status: str = "healthy"
    service_name: str = "TB-CXR Conformal Triage & HiResCAM Microservice"
    model_architecture: str = "DenseNet-121 (Multi-Center Trained)"
    model_checkpoint: str
    checkpoint_sha256: str
    optimal_temperature: float
    who_operating_point: float
    device: str
    safety_mode: str = "CLINICAL_DECISION_SUPPORT_ENFORCED"
    allow_autonomous_release: bool = False
    ood_detector_loaded: bool = False
    ood_threshold: Optional[float] = None

class ModelMetadataResponse(BaseModel):
    model_architecture: str
    total_parameters: int
    training_cohorts: List[str]
    in_distribution_performance: Dict[str, Any]
    independent_external_stress_test: Dict[str, Any]
    conformal_calibration: Dict[str, Any]
    who_cad_tpp_target: Dict[str, Any]
