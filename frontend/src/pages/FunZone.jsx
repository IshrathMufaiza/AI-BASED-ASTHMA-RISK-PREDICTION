import { useState } from "react";
import Sidebar from "../components/patient/Sidebar";
import "./FunZone.css";

function FunZone() {
    const [bubbleCount, setBubbleCount] = useState(0);
    const [breathing, setBreathing] = useState(false);

    const popBubble = () => {
        setBubbleCount((count) => count + 1);
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="fun-zone-page">
                <div className="fun-zone-header">
                    <h1>Little Breathe 🫧</h1>
                    <p>
                        A little space to play, relax, and breathe.
                    </p>
                </div>

                {/* Breathing Buddy */}
                <section className="little-breathe-card">
                    <div className="breathe-character">
                        <div
                            className={`breathe-circle ${
                                breathing ? "breathing" : ""
                            }`}
                        >
                            🐻
                        </div>
                    </div>

                    <div className="breathe-content">
                        <h2>Let's Breathe Together 🌬️</h2>

                        <p>
                            Follow the little bear. Watch it grow and shrink
                            slowly.
                        </p>

                        <button
                            className="fun-button"
                            onClick={() => setBreathing(!breathing)}
                        >
                            {breathing
                                ? "Stop"
                                : "Start"}
                        </button>

                        {breathing && (
                            <div className="breathing-message">
                                Breathe in... 🫁
                                <br />
                                Breathe out... 🌬️
                            </div>
                        )}
                    </div>
                </section>

                {/* Bubble Game */}
                <section className="bubble-game-card">
                    <div className="section-heading">
                        <span>🫧</span>
                        <div>
                            <h2>Pop the Bubbles!</h2>
                            <p>
                                Tap the bubbles and watch them disappear.
                            </p>
                        </div>
                    </div>

                    <div className="bubble-area">
                        <button
                            className="bubble bubble-one"
                            onClick={popBubble}
                            aria-label="Pop bubble"
                        >
                            🫧
                        </button>

                        <button
                            className="bubble bubble-two"
                            onClick={popBubble}
                            aria-label="Pop bubble"
                        >
                            🫧
                        </button>

                        <button
                            className="bubble bubble-three"
                            onClick={popBubble}
                            aria-label="Pop bubble"
                        >
                            🫧
                        </button>

                        <button
                            className="bubble bubble-four"
                            onClick={popBubble}
                            aria-label="Pop bubble"
                        >
                            🫧
                        </button>

                        <button
                            className="bubble bubble-five"
                            onClick={popBubble}
                            aria-label="Pop bubble"
                        >
                            🫧
                        </button>
                    </div>

                    <div className="bubble-score">
                        ⭐ Bubbles popped: {bubbleCount}
                    </div>
                </section>

                {/* Calm World */}
                <section className="calm-world-card">
                    <div className="calm-icon">🌈</div>

                    <div>
                        <h2>Calm Little World</h2>

                        <p>
                            Take a quiet moment with some friendly little
                            things.
                        </p>

                        <div className="calm-friends">
                            <span>☁️</span>
                            <span>🦋</span>
                            <span>🌸</span>
                            <span>⭐</span>
                            <span>🌙</span>
                            <span>🐰</span>
                        </div>
                    </div>
                </section>

                {/* Parent Note */}
                <section className="parent-note">
                    <span>👨‍👩‍👧</span>

                    <div>
                        <h3>For Parents & Caregivers</h3>

                        <p>
                            These activities are designed for simple
                            interaction and calming engagement. They are
                            not medical tests or a replacement for
                            professional medical care.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default FunZone;