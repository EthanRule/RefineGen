export default function ResumeSelector() {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Resume
      </label>
      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black">
        <option value="">Select a resume...</option>
        <option value="resume1">Resume 1</option>
        <option value="resume2">Resume 2</option>
        <option value="resume3">Resume 3</option>
      </select>
    </div>
  );
}
