import axios from "axios";
import { ApiError } from "./apiError.js";

const toxicityDetection = async (content) => {
    try {
        const response = await axios.post(
            "https://router.huggingface.co/hf-inference/models/unitary/toxic-bert",
            
            { inputs: content },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // [[{label: "toxicity", score: 0.92}, {label:"identity_attack", score:0.13}, ...]]
        const scores = response.data[0];

        const getScore = (label) => scores.find(s => s.label === label)?.score || 0;

        const toxic = getScore("toxicity") > 0.7;
        const severe = getScore("severe_toxicity") > 0.5;
        const insult = getScore("insult") > 0.7;
        const obscene = getScore("obscene") > 0.7;
        const hate = getScore("identity_attack") > 0.5;
        const threat = getScore("threat") > 0.4;

        if (toxic || severe || insult || obscene || hate || threat) {
            throw new ApiError(400, "Comment blocked: Detoxify flagged toxic content.");
        }

    } catch (error) {
        if (error instanceof ApiError) throw error;
        console.error("AI Moderation failed:", error.response?.data || error.message);
    }

}

export {toxicityDetection}
