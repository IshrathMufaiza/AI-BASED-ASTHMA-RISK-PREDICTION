import Sidebar from "../components/patient/Sidebar";
import "./AboutAsthmaWatch.css";

function AboutAsthmaWatch() {
    return (
        <div className="dashboard-layout">

            <Sidebar />

            <main className="about-watch-page">

                {/* Header */}

                <div className="about-watch-header">
                    <h1>About AsthmaWatch 💡</h1>

                    <p>
                        A smart platform designed to make asthma monitoring
                        simpler, more connected, and more proactive.
                    </p>
                </div>


                {/* What is AsthmaWatch? */}

                <section className="watch-card">

                    <h2>What is AsthmaWatch?</h2>

                    <p>
                        AsthmaWatch is a smart asthma monitoring platform
                        designed to help patients and healthcare professionals
                        monitor important respiratory health measurements
                        in one place.
                    </p>

                    <p>
                        The platform brings together patient health records,
                        vital measurements, risk assessment, alerts, and
                        doctor-patient communication to support continuous
                        asthma monitoring.
                    </p>

                </section>


                {/* Why AsthmaWatch? */}

                <section className="watch-card">

                    <h2>Why AsthmaWatch?</h2>

                    <div className="watch-feature-grid">

                        <div className="watch-feature">
                            <span>📊</span>
                            <h3>Continuous Monitoring</h3>
                            <p>
                                Keep important health measurements organized
                                and accessible for monitoring.
                            </p>
                        </div>

                        <div className="watch-feature">
                            <span>🚨</span>
                            <h3>Risk Detection</h3>
                            <p>
                                Identify potentially concerning changes
                                using health measurements and risk rules.
                            </p>
                        </div>

                        <div className="watch-feature">
                            <span>👨‍⚕️</span>
                            <h3>Doctor Connectivity</h3>
                            <p>
                                Help doctors monitor their assigned patients
                                and review their health information.
                            </p>
                        </div>

                        <div className="watch-feature">
                            <span>📋</span>
                            <h3>Health History</h3>
                            <p>
                                Maintain a record of previous health readings,
                                risk levels, and clinical information.
                            </p>
                        </div>

                    </div>

                </section>


                {/* Who is it for? */}

                <section className="watch-card">

                    <h2>Who is AsthmaWatch For?</h2>

                    <div className="audience-grid">

                        <div className="audience-item">
                            <span>🧑‍🦱</span>
                            <h3>Patients</h3>
                            <p>
                                Monitor personal health measurements and
                                understand changes in respiratory health.
                            </p>
                        </div>

                        <div className="audience-item">
                            <span>👨‍⚕️</span>
                            <h3>Doctors</h3>
                            <p>
                                Review assigned patients, health trends,
                                alerts, and clinical notes.
                            </p>
                        </div>

                        <div className="audience-item">
                            <span>👪</span>
                            <h3>Families & Caregivers</h3>
                            <p>
                                Support patients by helping them stay aware
                                of their health and monitoring needs.
                            </p>
                        </div>

                    </div>

                </section>


                {/* How It Works */}

                <section className="watch-card">

                    <h2>⚙️ How It Works</h2>

                    <p className="section-intro">
                        AsthmaWatch connects health data, risk analysis,
                        and patient-doctor communication into a single
                        monitoring workflow.
                    </p>


                    <div className="workflow">

                        <div className="workflow-step">

                            <div className="workflow-number">
                                1
                            </div>

                            <div>
                                <h3>Health Data Collection</h3>

                                <p>
                                    Health measurements such as heart rate,
                                    SpO₂, respiratory rate, and peak flow
                                    can be collected from sensors or entered
                                    into the monitoring system.
                                </p>
                            </div>

                        </div>


                        <div className="workflow-arrow">
                            ↓
                        </div>


                        <div className="workflow-step">

                            <div className="workflow-number">
                                2
                            </div>

                            <div>
                                <h3>Data Processing</h3>

                                <p>
                                    The collected measurements are processed
                                    and stored securely so they can be
                                    visualized and reviewed over time.
                                </p>
                            </div>

                        </div>


                        <div className="workflow-arrow">
                            ↓
                        </div>


                        <div className="workflow-step">

                            <div className="workflow-number">
                                3
                            </div>

                            <div>
                                <h3>Risk Analysis</h3>

                                <p>
                                    Health measurements are evaluated against
                                    predefined risk conditions to identify
                                    low, medium, or high-risk situations.
                                </p>
                            </div>

                        </div>


                        <div className="workflow-arrow">
                            ↓
                        </div>


                        <div className="workflow-step">

                            <div className="workflow-number">
                                4
                            </div>

                            <div>
                                <h3>Patient Dashboard</h3>

                                <p>
                                    Patients can view their latest readings,
                                    health trends, risk levels, and health
                                    history through their dashboard.
                                </p>
                            </div>

                        </div>


                        <div className="workflow-arrow">
                            ↓
                        </div>


                        <div className="workflow-step">

                            <div className="workflow-number">
                                5
                            </div>

                            <div>
                                <h3>Doctor Monitoring</h3>

                                <p>
                                    Assigned doctors can review patient
                                    information, health records, alerts,
                                    and clinical notes.
                                </p>
                            </div>

                        </div>


                        <div className="workflow-arrow">
                            ↓
                        </div>


                        <div className="workflow-step">

                            <div className="workflow-number">
                                6
                            </div>

                            <div>
                                <h3>Early Response</h3>

                                <p>
                                    When concerning health changes are
                                    identified, patients and healthcare
                                    professionals can respond appropriately
                                    and seek medical assistance when needed.
                                </p>
                            </div>

                        </div>

                    </div>

                </section>


                {/* Vision */}

                <section className="vision-card">

                    <h2>Our Vision</h2>

                    <p>
                        To make asthma monitoring more accessible,
                        connected, and proactive — helping patients
                        understand their health while giving healthcare
                        professionals better visibility into patient
                        conditions.
                    </p>

                    <div className="vision-tagline">
                        Predict. Prevent. Breathe. 🫁
                    </div>

                </section>


            </main>

        </div>
    );
}

export default AboutAsthmaWatch;