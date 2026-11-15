# AsthmaWatch – AI-Powered Asthma Monitoring and Risk Prediction System

AsthmaWatch is an AI-powered wearable asthma monitoring and risk prediction system designed to monitor physiological, respiratory, and environmental parameters using IoT sensors. It combines machine learning, explainable AI, and natural-language explanations to provide understandable insights into sensor readings.

The system is designed around two wearable devices: a wristband and a pendant. Sensor readings are intended to be processed by a backend and analysed using a Random Forest classification model. SHAP explains the model's predictions, while Google's Gemini API converts the prediction and feature contributions into human-readable explanations.

> **Project status:** The machine learning pipeline, explainability layer, Gemini integration, backend integration, and web dashboards have been implemented and tested using synthetic sensor data. Live ESP32-to-backend integration is still pending.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Objectives](#2-objectives)
3. [System Architecture](#3-system-architecture)
4. [Hardware Components](#4-hardware-components)
5. [Technology Stack](#5-technology-stack)
6. [AI and Machine Learning Pipeline](#6-ai-and-machine-learning-pipeline)
7. [Dataset and Data Processing](#7-dataset-and-data-processing)
8. [Model Evaluation](#8-model-evaluation)
9. [Explainable AI Using SHAP](#9-explainable-ai-using-shap)
10. [Natural-Language Explanations Using Gemini](#10-natural-language-explanations-using-gemini)
11. [Backend Architecture](#11-backend-architecture)
12. [Frontend and Dashboards](#12-frontend-and-dashboards)
13. [Project Structure](#13-project-structure)
14. [Installation and Setup](#14-installation-and-setup)
15. [Running the Application](#15-running-the-application)
16. [API Endpoints](#16-api-endpoints)
17. [Current Implementation Status](#17-current-implementation-status)
18. [Limitations and Future Improvements](#18-limitations-and-future-improvements)
19. [Important Disclaimer](#19-important-disclaimer)

---

## 1. Project Overview

AsthmaWatch aims to provide continuous monitoring of parameters that may be relevant to asthma management.

Traditional monitoring approaches often depend on periodic measurements and manual observation. AsthmaWatch explores how wearable sensors and machine learning can be combined to analyse multiple parameters and identify patterns associated with different risk categories.

The proposed system consists of:

- **Wristband:** Designed to collect physiological and environmental measurements.
- **Pendant:** Designed to collect respiratory audio measurements.
- **AI Service:** Processes sensor readings and predicts a risk category using a trained Random Forest model.
- **Explainability Layer:** Uses SHAP to identify features contributing to the prediction.
- **Language Explanation Layer:** Uses Gemini to communicate the model's output in understandable language.
- **Web Application:** Provides patient and doctor dashboards for viewing health information and AI-generated insights.

The AI model classifies readings into three categories:

- LOW
- MEDIUM
- HIGH

---

## 2. Objectives

The main objectives of AsthmaWatch are:

- To explore wearable-based monitoring of physiological, respiratory, and environmental parameters.
- To combine readings from multiple sensors for machine learning-based risk classification.
- To develop a Random Forest model for classifying readings into LOW, MEDIUM, and HIGH risk categories.
- To make model predictions more interpretable using SHAP.
- To generate human-readable explanations using Google's Gemini API.
- To provide patient and doctor dashboards for viewing readings, predictions, and relevant information.
- To establish an integrated IoT, backend, machine learning, and web application architecture.

---

## 3. System Architecture

AsthmaWatch follows a modular architecture consisting of hardware, backend, AI, and frontend components.

### Proposed hardware-to-application data flow

1. The wristband and pendant collect sensor measurements.
2. The ESP32 devices transmit readings to the backend.
3. The backend forwards the sensor readings to the Python AI service.
4. The Random Forest model predicts the risk category.
5. SHAP calculates feature contributions to the prediction.
6. Gemini generates a natural-language explanation using the model output and SHAP information.
7. The backend stores the prediction and associated information in MongoDB.
8. The React application retrieves and displays the results.

### AI processing flow

```text
Wristband Sensors + Pendant Microphone
                  |
                  v
             ESP32 Devices
                  |
                  v
          Node.js / Express Backend
                  |
                  v
          Python FastAPI AI Service
                  |
                  v
          Random Forest Classifier
                  |
                  v
          Risk Classification
          (LOW / MEDIUM / HIGH)
                  |
                  v
             SHAP Explainability
                  |
                  v
          Top Feature Contributions
                  |
                  v
            Google Gemini API
                  |
                  v
          Human-Readable Explanation
                  |
                  v
                MongoDB
                  |
                  v
          React Patient Dashboard
```

The Python AI service operates separately from the Node.js backend and communicates with it through an HTTP API.

---

## 4. Hardware Components

AsthmaWatch is designed around two wearable devices.

### 4.1 Wristband

The wristband is designed to collect physiological and environmental measurements.

| Component | Purpose |
|---|---|
| ESP32-S3 | Microcontroller for sensor interfacing and communication |
| MAX30102 | Heart rate and blood oxygen (SpO2) measurement |
| BME680 | Temperature, humidity, and gas resistance/VOC-related environmental sensing |

The BME680 is used for temperature, humidity, and gas resistance measurements. Barometric pressure is not included in the current system design.

### 4.2 Pendant

The pendant is designed to collect respiratory audio.

| Component | Purpose |
|---|---|
| ESP32-S3 | Microcontroller for sensor interfacing and communication |
| INMP441 | Digital microphone for collecting respiratory audio |

The INMP441 is intended to collect audio that can be processed to extract features associated with wheezing and coughing.

**Note:** The MPU6050 has been permanently removed from the project. The current pendant design does not include an accelerometer or gyroscope.

The hardware architecture and sensor components have been identified, but the complete live data pipeline from both ESP32 devices to the application has not yet been completed.

---

## 5. Technology Stack

### Hardware and firmware

- ESP32-S3
- MAX30102
- BME680
- INMP441
- Arduino/C++ firmware

### AI and machine learning

| Technology | Version | Purpose |
|---|---|---|
| Python | 3.13.14 | Data processing and machine learning |
| NumPy | 2.5.4 | Numerical operations |
| Pandas | 3.1.1 | Dataset processing |
| Scikit-learn | 1.9.1 | Random Forest classification and preprocessing |
| SHAP | 0.54.1 | Explainable AI |
| Matplotlib | 3.11.2 | Evaluation visualisations |
| FastAPI | 0.162.0 | AI service API |
| Uvicorn | 0.54.0 | ASGI server |
| Joblib | 1.6.0 | Saving and loading the trained model |
| Google GenAI SDK | Installed | Gemini API integration |

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- dotenv

### Frontend

| Technology | Version |
|---|---|
| React | 19.2.6 |
| React DOM | 19.2.6 |
| React Router DOM | 7.17.0 |
| Axios | 1.17.0 |
| Recharts | 3.8.1 |
| React-Toastify | 11.1.0 |
| Chart.js | 4.5.1 |
| react-chartjs-2 | 5.3.1 |

---

## 6. AI and Machine Learning Pipeline

The AI pipeline is implemented as an independent Python service.

### 6.1 Data preprocessing

The preprocessing pipeline handles numerical and categorical sensor features separately.

- Numerical features: Missing values are handled using median imputation.
- Categorical features: Missing values are handled using most-frequent imputation.
- Categorical variables: Encoded using One-Hot Encoding.

The preprocessing steps are included in the machine learning pipeline to ensure that the same transformations are applied during training and prediction.

### 6.2 Random Forest classifier

A Random Forest classifier is used to classify sensor readings into three risk categories:

- LOW
- MEDIUM
- HIGH

The model uses the following configuration:

| Parameter | Value |
|---|---|
| Algorithm | Random Forest Classifier |
| Number of estimators | 300 |
| Maximum features | sqrt |
| Class weighting | balanced_subsample |
| Random state | 42 |
| Parallel processing | n_jobs = -1 |

The trained preprocessing and classification pipeline is saved as:

`ai_service/models/risk_model.joblib`

### 6.3 Model input features

The existing trained model uses 23 features from the synthetic dataset.

**Wristband features**

| Feature | Description |
|---|---|
| hr_bpm | Heart rate |
| spo2_pct | Blood oxygen saturation |
| resp_rate_ppg | Respiratory rate derived from PPG |
| ppg_perfusion_index | PPG perfusion index |
| hrv_rmssd_ms | Heart rate variability (RMSSD) |
| ppg_signal_quality | PPG signal quality |
| temp_c | Temperature |
| humidity_pct | Humidity |
| gas_resistance_kohm | Gas resistance |

**Pendant audio features**

| Feature | Description |
|---|---|
| wheeze_index | Wheezing intensity indicator |
| wheeze_band_ratio | Wheezing frequency-band ratio |
| dominant_freq_hz | Dominant audio frequency |
| spectral_centroid_hz | Audio spectral centroid |
| spectral_flatness | Audio spectral flatness |
| cough_count | Cough count |
| ambient_noise_db | Ambient noise level |
| audio_quality | Audio signal quality |

**Additional features in the existing synthetic model**

| Feature | Description |
|---|---|
| accel_mean_g | Mean acceleration |
| accel_std_g | Acceleration variation |
| step_count | Step count |
| trunk_tilt_deg | Trunk tilt angle |
| activity_level | Activity category |
| posture | Posture category |

**Important hardware and model distinction:** The six additional features above remain part of the existing synthetic dataset and trained model schema. Since the MPU6050 has been removed, their real-world acquisition source is not currently defined in the hardware design. They must be addressed during model and hardware integration before claiming that all 23 features are available from the wearable devices.

The model excludes patient identifiers, session identifiers, timestamps, target labels, and synthetic latent variables from its input features.

---

## 7. Dataset and Data Processing

The current machine learning pipeline was developed and evaluated using a synthetic dataset.

### Dataset overview

| Property | Value |
|---|---|
| Total records | 50,400 |
| Synthetic patients | 60 |
| Features and metadata columns | 47 |
| Sampling window | 1 minute |
| Sessions per patient | 14 |
| Windows per session | 60 |

The dataset contains simulated physiological, respiratory, environmental, and movement-related measurements.

### Risk label distribution

| Risk category | Records |
|---|---:|
| LOW | 29,433 |
| MEDIUM | 13,642 |
| HIGH | 7,325 |

### Patient-level data splitting

To reduce patient-level data leakage, the dataset was split by patient rather than randomly splitting individual records.

| Split | Patients | Records |
|---|---:|---:|
| Training | 42 | 35,280 |
| Validation | 9 | 7,560 |
| Testing | 9 | 7,560 |

No patient overlap was found between the training, validation, and test sets.

Class imbalance was addressed using the Random Forest parameter `class_weight="balanced_subsample"`.

**Important:** The synthetic dataset is useful for developing and testing the software pipeline. Its labels are generated from synthetic rules and are not clinically validated asthma risk labels.

---

## 8. Model Evaluation

The trained Random Forest model was evaluated using the held-out validation and test datasets.

### Validation results

| Metric | Score |
|---|---:|
| Balanced Accuracy | 0.9268 |
| Macro F1-score | 0.9246 |

### Test results

| Metric | Score |
|---|---:|
| Accuracy | 0.9619 |
| Balanced Accuracy | 0.9493 |
| Macro F1-score | 0.9506 |

### Test classification report

| Class | Precision | Recall | F1-score |
|---|---:|---:|---:|
| LOW | 0.98 | 0.98 | 0.98 |
| MEDIUM | 0.91 | 0.92 | 0.91 |
| HIGH | 0.97 | 0.95 | 0.96 |

Test-set support:

- LOW: 5,048
- MEDIUM: 1,662
- HIGH: 850

### Confusion matrix

Rows represent actual classes and columns represent predicted classes. Class order: LOW, MEDIUM, HIGH.

| Actual / Predicted | LOW | MEDIUM | HIGH |
|---|---:|---:|---:|
| LOW | 4933 | 115 | 0 |
| MEDIUM | 105 | 1533 | 24 |
| HIGH | 0 | 44 | 806 |

### Probability calibration

The model's probability calibration was also evaluated.

| Metric | Score |
|---|---:|
| Multiclass Brier Score | 0.0589 |
| Log Loss | 0.1035 |
| Top-label Expected Calibration Error | 0.0208 |

These results describe performance on the synthetic held-out test dataset only. They must not be interpreted as clinical accuracy or real-world asthma prediction performance.

---

## 9. Explainable AI Using SHAP

AsthmaWatch integrates SHAP (SHapley Additive exPlanations) to provide insight into the Random Forest model's predictions.

Rather than displaying only a risk category, the system calculates feature contributions to help explain how the model arrived at its output.

For each prediction, the explainability module:

1. Processes the sensor readings using the trained preprocessing pipeline.
2. Calculates SHAP feature contributions.
3. Identifies the most influential features.
4. Formats the contributions into understandable descriptions.
5. Provides the feature values, units, sensor sources, and contribution directions.

The dashboard displays features as either:

- Increased model risk
- Reduced model risk

These descriptions refer to how the features influenced the model prediction, not to proven medical causes.

---

## 10. Natural-Language Explanations Using Gemini

AsthmaWatch integrates Google's Gemini API to make the model's output easier to understand.

The Gemini integration receives:

- Predicted risk category.
- Model probabilities.
- Top SHAP feature contributions.
- Relevant sensor readings.

It generates a natural-language explanation containing:

- The predicted risk category.
- Model probabilities.
- An overall explanation.
- Important contributing features.
- Features pushing the prediction towards or away from the predicted risk.
- An important disclaimer about the experimental nature of the prediction.

### Separation of responsibilities

| Component | Responsibility |
|---|---|
| Random Forest | Produces the risk classification and probabilities |
| SHAP | Explains feature contributions to the model output |
| Gemini | Converts the model output and SHAP information into human-readable language |

Gemini does not determine or modify the Random Forest risk classification.

The Gemini integration is designed to avoid inventing readings, interpreting model probabilities as asthma attack probabilities, or presenting SHAP contributions as medical causes.

If Gemini is unavailable, the AI service is designed to return the Random Forest prediction without making the prediction itself dependent on Gemini's availability.

**API model configured:** `gemini-3.6-flash`

A valid Gemini API key is required to generate language explanations.

---

## 11. Backend Architecture

AsthmaWatch uses a Node.js and Express backend connected to MongoDB.

The backend is responsible for:

- User authentication and authorisation.
- Patient and doctor functionality.
- Health record management.
- Alert management.
- AI prediction requests.
- Communication with the Python AI service.
- Saving AI prediction results in MongoDB.
- Retrieving patient-specific information and prediction history.

### AI service integration

The Node.js backend communicates with the Python FastAPI service through HTTP requests.

The integration follows this sequence:

1. An authenticated request reaches the AI prediction route.
2. The backend forwards the sensor readings to the Python AI service.
3. The AI service returns the predicted risk, probabilities, SHAP explanation, and Gemini explanation when available.
4. The backend stores the result in MongoDB.
5. The prediction is associated with the authenticated patient.

### AI prediction data storage

The `AIPrediction` model stores:

- Patient ID.
- Sensor readings.
- Predicted risk.
- Model probabilities.
- SHAP explanations.
- Gemini language explanation.
- Model type.
- Explainability method.
- Language model.
- Prediction timestamp.
- Data source (`TEST` or `DEVICE`).

The data-source field distinguishes manually submitted test predictions from predictions received through the intended hardware integration.

### Existing health record functionality

The application also has a separate health record system.

Its current risk classification is based on predefined thresholds for heart rate, SpO2, respiratory rate, and peak flow.

This rule-based classification is separate from the Random Forest AI prediction system. The two outputs are not interchangeable.

---

## 12. Frontend and Dashboards

The frontend is developed using React.

It provides separate patient and doctor interfaces.

### Patient dashboard

The patient dashboard includes:

- Patient information.
- Health record summaries.
- Vital measurements.
- Health trend visualisations.
- Health history.
- AI-generated risk predictions.
- Model probability distributions.
- SHAP feature contributions.
- Gemini-generated explanations.
- Previous AI prediction summaries.
- Light and dark themes.

The AI Insights section displays the latest available device prediction and previous device predictions. Manually submitted test predictions are excluded from the device prediction display.

### Doctor dashboard

The doctor-facing application includes:

- Patient information and listings.
- Patient search.
- Dashboard summaries.
- Clinical incident information.
- Patient details.
- Health records and related patient information.
- Doctor notes.

The frontend communicates with the Node.js backend using Axios and protected API requests.

---

## 13. Project Structure

```text
asthma-monitoring/
│
├── ai_service/
│   ├── data/
│   │   ├── asthmawatch_synthetic_dataset.csv
│   │   ├── asthmawatch_synthetic_patients.csv
│   │   └── docs/
│   │       ├── DATA_DICTIONARY.md
│   │       └── README (asthma data).md
│   │
│   ├── models/
│   │   ├── risk_model.joblib
│   │   ├── calibration_metrics.json
│   │   ├── calibration_plot.png
│   │   ├── test_metrics.json
│   │   └── validation_metrics.json
│   │
│   ├── scripts/
│   │   ├── evaluate_calibration.py
│   │   ├── evaluate_test.py
│   │   ├── explain_sample.py
│   │   ├── generate_synthetic_data.py
│   │   ├── test_explainability.py
│   │   ├── test_gemini.py
│   │   ├── test_language_explainer.py
│   │   └── train_model.py
│   │
│   ├── api.py
│   ├── explainability.py
│   ├── feature_config.py
│   ├── feature_formatter.py
│   ├── inspect_dataset.py
│   └── language_explainer.py
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   ├── testMongo.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── doctor/
│   │   │   └── patient/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
└── .gitignore
```

---

## 14. Installation and Setup

### Prerequisites

Install the following:

- Python 3.13.14
- Node.js and npm
- MongoDB connection
- Git
- A Gemini API key for natural-language explanations

Clone the repository:

```bash
git clone https://github.com/IshrathMufaiza/AI-BASED-ASTHMA-RISK-PREDICTION.git
```

Move into the project directory:

```bash
cd AI-BASED-ASTHMA-RISK-PREDICTION
```

### 14.1 Set up the Python AI service

Navigate to the AI service directory:

```bash
cd ai_service
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the Python dependencies:

```bash
pip install pandas==3.1.1 numpy==2.5.4 scikit-learn==1.9.1 shap==0.54.1 matplotlib==3.11.2 fastapi==0.162.0 uvicorn==0.54.0 joblib==1.6.0 google-genai python-dotenv
```

Create an `.env` file inside `ai_service/`:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
```

Never commit this file or expose your API key publicly.

The trained model is stored at:

`ai_service/models/risk_model.joblib`

If you want to retrain the model:

```bash
python scripts/train_model.py
```

### 14.2 Set up the backend

Open another terminal and navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside `backend/` with the required configuration:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AI_SERVICE_URL=http://127.0.0.1:8000
```

Use the variable names required by your backend configuration for any additional settings.

Never upload your actual database credentials or JWT secret.

### 14.3 Set up the frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

The frontend uses this variable to communicate with the backend.

---

## 15. Running the Application

The AI service, backend, and frontend run as separate processes.

### Terminal 1 – Python AI service

```powershell
cd ai_service
.\.venv\Scripts\Activate.ps1
uvicorn api:app --reload
```

The AI service runs at:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

Health check:

`http://127.0.0.1:8000/health`

### Terminal 2 – Node.js backend

```bash
cd backend
npm run dev
```

The backend is configured to run on port 5000 in the current development setup.

### Terminal 3 – React frontend

```bash
cd frontend
npm run dev
```

Open the local URL displayed by Vite in the terminal.

---

## 16. API Endpoints

### Python AI service

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check AI service health |
| POST | `/predict` | Generate a risk prediction and explanations |

The prediction endpoint accepts sensor readings corresponding to the configured 23 model features.

### Node.js backend

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/ai-predictions` | Generate and save an AI prediction |
| GET | `/api/health-records` | Retrieve health records |
| POST | `/api/health-records` | Add a health record |
| GET | `/api/patients/:id` | Retrieve patient details and associated information |

Authentication is required for protected endpoints.

Other routes support authentication, dashboard information, doctor functionality, and patient management.

---

## 17. Current Implementation Status

| Component | Status |
|---|---|
| Synthetic dataset generation and inspection | Implemented |
| Data preprocessing pipeline | Implemented |
| Random Forest model training | Implemented |
| Patient-level data splitting | Implemented |
| Model evaluation | Implemented |
| Probability calibration evaluation | Implemented |
| SHAP explainability | Implemented |
| Gemini language explanations | Implemented and tested |
| Python FastAPI service | Implemented and tested |
| Node.js backend integration | Implemented and tested |
| MongoDB AI prediction storage | Implemented and tested |
| Patient dashboard AI Insights | Implemented |
| Doctor dashboard | Implemented |
| Light and dark themes | Implemented |
| MPU6050 | Permanently removed |
| ESP32 wristband-to-backend integration | Pending |
| ESP32 pendant-to-backend integration | Pending |
| Live sensor-to-AI-to-dashboard testing | Pending |
| Resolution of movement-related model features after hardware change | Pending |

---

## 18. Limitations and Future Improvements

### Current limitations

1. **Synthetic training data:** The current model is trained and evaluated using synthetic data rather than a clinically validated dataset.
2. **Clinical validation:** The model's performance on synthetic data does not establish its performance on real asthma patients.
3. **Hardware integration:** The complete live connection between the wearable devices and the backend is still pending.
4. **Movement-related features:** The existing synthetic model includes movement-related features, but the MPU6050 has been removed. Their real-world acquisition source and their continued use in the model need to be resolved before live inference.
5. **Sensor reliability:** Real-world signal quality, noise, motion artefacts, and missing sensor readings need to be evaluated during hardware integration.
6. **Internet dependency:** Gemini-based language explanations require internet connectivity and access to the Gemini API.

### Future improvements

- Complete wristband and pendant integration with the backend.
- Implement reliable device identification and patient mapping.
- Synchronise readings from both wearable devices using timestamps.
- Validate the feature extraction pipeline using actual sensor measurements.
- Resolve or redesign the movement-related model features that no longer have an assigned hardware source.
- Collect and evaluate appropriate real-world respiratory and physiological datasets.
- Evaluate the model on independent, representative data.
- Improve robustness against missing readings, noise, and sensor disconnections.
- Complete end-to-end testing of the wearable, AI service, backend, and dashboards.
- Further improve alert and notification functionality.

---

## 19. Important Disclaimer

AsthmaWatch is an experimental academic prototype developed to explore IoT-based monitoring, machine learning classification, and explainable AI for asthma-related monitoring.

The current Random Forest model uses synthetic training data. Its predictions, probabilities, and SHAP explanations are not clinically validated.

Model probabilities must not be interpreted as the probability of an asthma attack. SHAP contributions describe model behaviour, not medical causes.

AsthmaWatch is not a medical diagnostic device and must not be used to make medication, treatment, or emergency-care decisions.

---

## Author and Project

**Project:** AsthmaWatch – AI-Powered Asthma Monitoring and Risk Prediction System

**Repository:** [AI-BASED-ASTHMA-RISK-PREDICTION](https://github.com/IshrathMufaiza/AI-BASED-ASTHMA-RISK-PREDICTION)

**Developed using:** IoT, Python, Machine Learning, Explainable AI, Generative AI, Node.js, MongoDB, and React.
