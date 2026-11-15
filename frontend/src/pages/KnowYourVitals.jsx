import Sidebar from "../components/patient/Sidebar";
import "./KnowYourVitals.css";

function KnowYourVitals() {
    return (
        <div className="dashboard-layout">

            <Sidebar />

            <main className="vitals-info-page">

                {/* Header */}

                <div className="vitals-info-header">
                    <h1>Know Your Vitals 🩺</h1>

                    <p>
                        Understanding the health measurements monitored by
                        AsthmaWatch can help you understand your respiratory
                        health better.
                    </p>
                </div>


                {/* Vital Cards */}

                <div className="vitals-info-grid">

                    <div className="vital-info-card">

                        <div className="vital-info-icon">
                            ❤️
                        </div>

                        <h2>Heart Rate</h2>

                        <p>
                            Heart rate tells us how many times your heart
                            beats in one minute. Changes in heart rate can
                            provide useful information about your body's
                            condition.
                        </p>

                        <div className="sensor-info">
                            <strong>How it can be measured</strong>
                            <span>Optical heart-rate sensor</span>
                        </div>

                        <div className="dashboard-value">
                            Dashboard → <strong>bpm</strong>
                        </div>

                    </div>


                    <div className="vital-info-card">

                        <div className="vital-info-icon">
                            🫁
                        </div>

                        <h2>SpO₂</h2>

                        <p>
                            SpO₂ represents the percentage of oxygen
                            saturation in your blood. It is an important
                            measurement when monitoring respiratory health.
                        </p>

                        <div className="sensor-info">
                            <strong>How it can be measured</strong>
                            <span>Pulse oximeter / optical sensor</span>
                        </div>

                        <div className="dashboard-value">
                            Dashboard → <strong>%</strong>
                        </div>

                    </div>


                    <div className="vital-info-card">

                        <div className="vital-info-icon">
                            🌬️
                        </div>

                        <h2>Respiratory Rate</h2>

                        <p>
                            Respiratory rate tells us how many breaths a
                            person takes in one minute. It can help indicate
                            changes in breathing patterns.
                        </p>

                        <div className="sensor-info">
                            <strong>How it can be measured</strong>
                            <span>
                                Respiratory sensing / motion-based sensing
                            </span>
                        </div>

                        <div className="dashboard-value">
                            Dashboard → <strong>rpm</strong>
                        </div>

                    </div>


                    <div className="vital-info-card">

                        <div className="vital-info-icon">
                            💨
                        </div>

                        <h2>Peak Flow</h2>

                        <p>
                            Peak flow measures how quickly air can be
                            forcefully exhaled from the lungs. It can help
                            monitor changes in airway function.
                        </p>

                        <div className="sensor-info">
                            <strong>How it can be measured</strong>
                            <span>Peak-flow measurement device</span>
                        </div>

                        <div className="dashboard-value">
                            Dashboard → <strong>L/min</strong>
                        </div>

                    </div>

                </div>


                {/* How Sensors Work */}

                <section className="sensor-process-card">

                    <h2>🔬 How Do Sensors Help AsthmaWatch?</h2>

                    <p>
                        Sensors can collect health measurements and send
                        the readings to a processing system. AsthmaWatch can
                        then use these measurements to display health trends
                        and identify potentially concerning changes.
                    </p>

                   <div className="sensor-flow">

    <div className="flow-item sensors-flow">
        <span>⌚</span>
        <strong>Sensors</strong>
        <small>Collect measurements</small>
    </div>

    <div className="flow-arrow arrow-sensors-data">
        →
    </div>

    <div className="flow-item data-flow">
        <span>📡</span>
        <strong>Data</strong>
        <small>Transmit readings</small>
    </div>

    <div className="flow-arrow arrow-data-processing">
        ↙
    </div>

    <div className="flow-item processing-flow">
        <span>🧠</span>
        <strong>Processing</strong>
        <small>Analyze measurements</small>
    </div>

    <div className="flow-arrow arrow-processing-dashboard">
        →
    </div>

    <div className="flow-item dashboard-flow">
        <span>📊</span>
        <strong>Dashboard</strong>
        <small>View health information</small>
    </div>

</div>

                </section>


                {/* Important Note */}

                <section className="vitals-note">

                    <span>💡</span>

                    <p>
                        <strong>Remember:</strong> AsthmaWatch is designed
                        to support health monitoring and does not replace
                        professional medical advice, diagnosis, or emergency
                        care.
                    </p>

                </section>

            </main>

        </div>
    );
}

export default KnowYourVitals;