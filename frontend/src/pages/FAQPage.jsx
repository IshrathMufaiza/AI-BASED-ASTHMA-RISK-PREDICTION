import { useState } from "react";
import Sidebar from "../components/patient/Sidebar";
import "./FAQPage.css";
function FAQPage() {

    const [openFAQ, setOpenFAQ] = useState(null);

    const faqs = [
        {
            question: "What is asthma?",
            answer:
                "Asthma is a chronic condition that affects the airways in the lungs. The airways can become inflamed and narrowed, which may make breathing difficult."
        },
        {
            question: "What are common symptoms of asthma?",
            answer:
                "Common symptoms include coughing, wheezing, shortness of breath, and chest tightness. Symptoms can vary from person to person."
        },
        {
            question: "What can trigger asthma symptoms?",
            answer:
                "Common triggers include air pollution, pollen, dust, smoke, respiratory infections, cold air, exercise, and exposure to other environmental irritants."
        },
        {
            question: "Can asthma symptoms happen suddenly?",
            answer:
                "Yes. Asthma symptoms can sometimes appear or worsen suddenly. Monitoring changes in respiratory health can help identify concerning changes earlier."
        },
        {
            question: "Can asthma be cured?",
            answer:
                "There is currently no cure for asthma, but it can often be managed effectively with appropriate treatment, trigger avoidance, monitoring, and guidance from a healthcare professional."
        },
        {
            question: "Why is monitoring important for people with asthma?",
            answer:
                "Regular monitoring can help patients and healthcare professionals recognize changes in symptoms and health measurements and respond appropriately."
        },
        {
            question: "What should I do during a severe asthma attack?",
            answer:
                "If breathing becomes severely difficult, symptoms rapidly worsen, or a person is struggling to speak or breathe, seek emergency medical care immediately. Follow the person's prescribed asthma action plan if one is available."
        },
        {
            question: "Does AsthmaWatch replace a doctor?",
            answer:
                "No. AsthmaWatch is designed to support monitoring and communication. It does not replace professional medical diagnosis, treatment, or emergency care."
        }
    ];

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <main className="faq-page">

                <div className="faq-header">
                    <h1>Asthma FAQs ❓</h1>

                    <p>
                        Quick answers to common questions about asthma,
                        symptoms, triggers, and monitoring.
                    </p>
                </div>

                <div className="faq-container">

                    {faqs.map((faq, index) => (

                        <div
                            className={`faq-item ${
                                openFAQ === index ? "open" : ""
                            }`}
                            key={index}
                        >

                            <button
                                className="faq-question"
                                onClick={() => toggleFAQ(index)}
                            >
                                <span>{faq.question}</span>

                                <span className="faq-icon">
                                    {openFAQ === index ? "−" : "+"}
                                </span>
                            </button>

                            {openFAQ === index && (
                                <div className="faq-answer">
                                    <p>{faq.answer}</p>
                                </div>
                            )}

                        </div>

                    ))}

                </div>

            </main>

        </div>
    );
}

export default FAQPage;