"""
TB Conformal Triage & HiResCAM Package
Auditable clinical decision support system for pulmonary tuberculosis screening.
Supporting Dual-Model Architecture: Model v9 (Paper 1 Baseline) and Model v11 (Paper 2 BioMedCLIP Distilled).
"""

from .model import (
    StandaloneDenseNet121,
    TBCXRClassifier,
    DistilledTBCXRClassifier,
    TBTriageEngine,
    create_triage_engine,
)
from .iqa import evaluate_image_quality, auto_correct_image
from .ood import MahalanobisOODDetector

__version__ = "2.0.0"
__author__ = "M. Farrel Aditya"
__email__ = "farreladitya38@gmail.com"

__all__ = [
    "StandaloneDenseNet121",
    "TBCXRClassifier",
    "DistilledTBCXRClassifier",
    "TBTriageEngine",
    "create_triage_engine",
    "evaluate_image_quality",
    "auto_correct_image",
    "MahalanobisOODDetector",
]
