import React, { useState } from 'react';
import axios from 'axios';

const ResumeGenerator = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    summary: '',
    skills: '',
    experience: '',
    education: ''
  });

  const [generatedResume, setGeneratedResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/generate-resume', formData);
      setGeneratedResume(response.data);
    } catch (error) {
      console.error('Resume generation error:', error);
      setError('Failed to generate resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Resume Generator</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          placeholder="Professional Summary (Brief overview of your career)"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          rows="3"
        />

        <textarea
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          placeholder="Skills (Separate with commas)"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          rows="2"
        />

        <textarea
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          placeholder="Work Experience (Job Title, Company, Key Responsibilities)"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          rows="3"
        />

        <textarea
          name="education"
          value={formData.education}
          onChange={handleChange}
          placeholder="Education (Degree, Institution, Graduation Year)"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          rows="2"
        />

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full p-3 rounded text-white ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          } transition duration-300`}
        >
          {loading ? 'Generating...' : 'Generate Resume'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {generatedResume && (
        <div className="mt-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Generated Resume</h2>
          <div className="border-2 border-dashed p-4">
            <img 
              src={generatedResume.resume_image} 
              alt="Generated Resume" 
              className="max-w-full mx-auto h-auto shadow-lg rounded"
            />
            <a 
              href={generatedResume.resume_image} 
              download="resume.png"
              className="mt-4 inline-block bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition duration-300"
            >
              Download Resume
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeGenerator;