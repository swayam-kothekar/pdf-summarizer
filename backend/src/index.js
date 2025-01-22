// Backend (Node.js) - server.js
const express = require('express');
const multer = require('multer');
const { PDFLoader } = require('langchain/document_loaders/fs/pdf');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { HuggingFaceInference } = require('langchain/llms/hf');
const { loadSummarizationChain } = require('langchain/chains');
const { PromptTemplate } = require("langchain/prompts");
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(cors());

const upload = multer({ dest: 'uploads/' });

const model = new HuggingFaceInference({
    model: "mistralai/Mistral-7B-Instruct-v0.2",
    temperature: 0.5,
    maxTokens: 1000,
    apiKey: process.env.HUGGINGFACEHUB_API_TOKEN
});

const promptTemplate = new PromptTemplate({
    template: `<s>[INST] Please provide a concise summary of the following text:

{text}

Focus on the main points and key ideas. [/INST]</s>`,
    inputVariables: ["text"]
});

app.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        const loader = new PDFLoader(req.file.path);
        const docs = await loader.load();

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 2000,
            chunkOverlap: 200
        });
        const splits = await textSplitter.splitDocuments(docs);

        const chain = loadSummarizationChain(model, { 
            type: "map_reduce",
            combinePrompt: promptTemplate,
            mapPrompt: promptTemplate
        });

        const summary = await chain.invoke({
            input_documents: splits,
        });

        res.json({ summary: summary.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing PDF' });
    }
});

app.listen(3001, () => {
    console.log('Server running on port 3001');
});

