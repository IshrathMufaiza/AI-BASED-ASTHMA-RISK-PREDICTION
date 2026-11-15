import Sidebar from "../components/patient/Sidebar";
import "./AboutAsthma.css";

function AboutAsthma() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="about-asthma-page">

        <div className="about-asthma-header">
          <h1>About Asthma 🫁</h1>
          <p>
            Understanding asthma can help you recognize symptoms,
            avoid triggers, and respond early.
          </p>
        </div>

        <section className="asthma-card">
          <h2>What is Asthma?</h2>
          <p>
            Asthma is a chronic condition that affects the airways
            that carry air in and out of the lungs. During an asthma
            episode, the airways can become inflamed, narrowed, and
            produce extra mucus, making breathing difficult.
          </p>
        </section>

        <section className="asthma-card">
          <h2>Common Symptoms</h2>

          <div className="asthma-list">
            <div>🌬️ Shortness of breath</div>
            <div>😮‍💨 Wheezing</div>
            <div>💨 Difficulty breathing</div>
            <div>🫁 Chest tightness</div>
            <div>🤧 Persistent coughing</div>
            <div>🌙 Coughing that may become worse at night</div>
          </div>
        </section>

        <section className="asthma-card">
          <h2>Common Asthma Triggers</h2>

          <div className="asthma-list">
            <div>🌫️ Air pollution</div>
            <div>🌸 Pollen and allergens</div>
            <div>🐈 Pet dander</div>
            <div>❄️ Cold air</div>
            <div>🏃 Physical activity</div>
            <div>🦠 Respiratory infections</div>
            <div>💨 Smoke and strong odors</div>
            <div>😰 Stress and strong emotions</div>
          </div>
        </section>

        <section className="asthma-card">
          <h2>What Happens During an Asthma Attack?</h2>

          <p>
            During an asthma attack, the airways can become narrower
            and inflamed. This can reduce the amount of air reaching
            the lungs and may cause symptoms such as wheezing,
            coughing, chest tightness, and difficulty breathing.
          </p>

          <div className="warning-box">
            ⚠️ If breathing difficulty becomes severe or symptoms
            rapidly worsen, seek immediate medical attention.
          </div>
        </section>

        <section className="asthma-card">
          <h2>Why Monitoring Matters</h2>

          <p>
            Regular monitoring of important health measurements can
            help patients and healthcare professionals understand
            changes in respiratory health. AsthmaWatch is designed
            to bring these measurements together in one place so
            changes can be identified and communicated more easily.
          </p>
        </section>

      </main>
    </div>
  );
}

export default AboutAsthma;