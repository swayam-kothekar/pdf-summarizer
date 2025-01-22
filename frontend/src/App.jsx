import React, { useState } from 'react';
import { FileText, Upload, AlertCircle, Check } from 'lucide-react';
import axios from 'axios';

const App = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleSubmit = async (e) => {
    if (!file) return;
    
    setLoading(true);
    setProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await axios.post('http://localhost:3001/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });
      
      setSummary(response.data.summary);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to process PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 space-y-4">
          <div className="bg-blue-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            PDF Summarizer
          </h1>
          <p className="text-lg text-blue-200/80">Transform your documents into concise summaries</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          <div
            className={`relative rounded-2xl transition-all duration-300 ${
              isDragging
                ? 'bg-blue-500/10 border-2 border-blue-400/50'
                : 'bg-white/5 border-2 border-white/10'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="p-12 text-center space-y-4">
              <div className="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-lg text-gray-300">
                Drop your PDF here, or{' '}
                <label className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </label>
              </p>
              <p className="text-sm text-gray-400">Maximum file size: 10MB</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 text-red-400 bg-red-500/10 p-4 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {file && (
            <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-gray-300">{file.name}</span>
              </div>
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
          )}

          {loading && (
            <div className="space-y-2">
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-center text-blue-200/80">
                Processing: {progress}%
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className={`w-full py-4 rounded-xl font-medium transition-all duration-300 ${
              !file || loading
                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90'
            }`}
          >
            {loading ? 'Processing PDF...' : 'Generate Summary'}
          </button>

          {summary && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Summary
              </h2>
              <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm">
                <p className="text-gray-300 leading-relaxed">{summary}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;