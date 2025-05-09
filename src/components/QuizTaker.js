import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {getQuestionsForDocument, incrementQuizCount} from "../services/firestoreService";

export default function QuizTaker() {
    const {state} = useLocation(); // { docId, type, questions }
    const {currentUser} = useAuth();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        async function fetch() {
            if (state.questions) {
                setQuestions(state.questions);
            } else if (state.docId && currentUser) {
                const q = await getQuestionsForDocument(currentUser.uid, state.docId, state.type);
                setQuestions(q);
            }
        }

        fetch();
    }, [state, currentUser]);

    const handleSubmit = async () => {
        const results = questions.map((q, i) => {
            const userAnswer = answers[i] ?? "";
            const correctAnswer = q.answer ?? "";

            let isCorrect;

            if (state.type === "fitb") {
                isCorrect = String(userAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
            } else {
                isCorrect = userAnswer === q.answer;
            }

            return {
                correct: isCorrect,
                questionIndex: i
            };
        });

        const correctCount = results.filter(r => r.correct).length;
        const totalCount = results.length;

        // ✅ Update only global stats, not per-document
        await incrementQuizCount(currentUser.uid, state.type, correctCount, totalCount);

        navigate("/results", {
            state: {
                answers,
                questions,
                type: state.type
            }
        });
    };

    return (
        <div className="text-white p-6 min-h-screen bg-gradient-to-b from-black to-gray-900">
            <h2 className="text-3xl font-bold text-purple-300 mb-6">🧪 {state.type.toUpperCase()} Quiz</h2>

            <div className="space-y-6">
                {questions.map((q, i) => (
                    <div key={i}
                         className="bg-gray-800/70 border border-purple-600 rounded-2xl p-6 shadow-md backdrop-blur">
                        <p className="text-lg font-semibold mb-3">{i + 1}. {q.question}</p>

                        {!q.choices && state.type === "fitb" ? (
                            <input
                                type="text"
                                value={answers[i] || ""}
                                onChange={(e) => setAnswers({...answers, [i]: e.target.value})}
                                className="w-full bg-black border border-purple-500 p-2 rounded mt-2"
                                placeholder="Type your answer..."
                            />
                        ) : q.choices ? (
                            q.choices.map((choice, j) => (
                                <label key={j} className="block mb-2">
                                    <input
                                        type="radio"
                                        name={`q-${i}`}
                                        value={choice}
                                        checked={answers[i] === choice}
                                        onChange={() => setAnswers({...answers, [i]: choice})}
                                        className="mr-2"
                                    />
                                    {choice}
                                </label>
                            ))
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setAnswers({...answers, [i]: true})}
                                    className={`bg-purple-600 px-4 py-1 rounded-lg hover:bg-purple-700 ${answers[i] === true ? 'ring-2 ring-purple-400' : ''}`}
                                >
                                    True
                                </button>
                                <button
                                    onClick={() => setAnswers({...answers, [i]: false})}
                                    className={`bg-purple-600 px-4 py-1 rounded-lg hover:bg-purple-700 ${answers[i] === false ? 'ring-2 ring-purple-400' : ''}`}
                                >
                                    False
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="text-center mt-8">
                <button
                    onClick={handleSubmit}
                    className="bg-green-600 px-6 py-2 rounded-xl hover:bg-green-700 shadow-md text-white"
                >
                    Submit Quiz
                </button>
            </div>
        </div>
    );
}
