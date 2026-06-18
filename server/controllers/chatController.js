const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

const chatWithGemini = async (req, res) => {
    try {

        console.log("Gemini Key Loaded:", process.env.GEMINI_API_KEY);
        console.log("Gemini Key:", process.env.GEMINI_API_KEY);

        const { message } = req.body;

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        const result = await model.generateContent(message);

        const reply = result.response.text();

        res.json({
            reply
        });
    } catch (error) {

    console.log("FULL GEMINI ERROR:");
    console.log(error);

    res.status(500).json({
        message: error.message
    });

}
};

module.exports = {
    chatWithGemini
};