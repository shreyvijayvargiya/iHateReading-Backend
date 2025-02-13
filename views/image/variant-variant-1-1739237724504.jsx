import React from "react";

function TodoApp() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("Please enter a valid task item with text and one space character. (Example: \"Add\" to start a task.)");
  
  const tasks = [];
  
  useEffect(() => {
    if (isLoading) {
      // Show loading animation
      setTimeout(() => {
        setIsLoading(true);
        return null;
      }, 2000);
    }
  }, [isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!error) {
      setError("You have successfully added a task item. Your current text will appear below. They will appear below - " + error);
      
      // Add the new task to tasks array
      tasks.push({
        id: Date.now(),
        title: "Add",
        description: "This is an example task item with text and one space character."
      });
      
      try {
        return await Promise.all(tasks.map((task, index) => (
          <div key={index} className="mt-2 bg-slate-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            style={{ backgroundColor: 'slate-800', borderRadius: '4px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
        ))}
      } catch (err) {
        console.error('An error occurred while adding task:', err);
        // You can add your error handling here
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#{ darkMode.key-primary}]-bg-opacity-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-lg text-gray-800 mb-8">Todo App</h1>
        
        <form onSubmit={handleSubmit} className="mt-8" disabled>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              placeholder="Enter a task item with text and one space character."
              value={error}
              onChange={(e) => {
                e.preventDefault();
                setError('Please enter a valid task.');
                error.textContent = 'Invalid input. Please try again.';
                if (error.value.trim() !== '') {
                  error.value.trim()
                    .replace(/ /g, '')
                    .trim()
                    .toLowerCase()
                    .split(/[\/]\W+/).forEach(s => {
                      throw new Error(`Unrecognized error: ${s}`);
                    });
                  }
                }
              } 
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Add a task here..."
              value={error}
              onChange={(e) => {
                e.preventDefault();
                setError('Please enter an existing task item number to complete this task.');
                error.textContent = 'Please add a task first.';
                if (error.value) {
                  error.value.toLowerCase()
                    .replace(/ /g, '')
                    .trim()
                    .toLowerCase().split(/[\/]\W+/).forEach(s => {
                      throw new Error(`Unrecognized error: ${s}`);
                    });
                }
              }
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-600 text-white py-2 px-4 rounded shadow-md hover:bg-slate-700 focus:outline-none font focus:)
          >
            {isLoading ? 'Adding task...' : 'Add task'}
          </button>
          
          <div className="mt-6 grid grid-cols-2 gap-2">
            <div className="text-sm text-gray-500">{index + 1}.</div>
            <div>{tasks[index].title}</div>
            <div style={{ backgroundColor: 'slate-800', borderRadius: '4px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}></div>
          </div>
        </form>

        {error && (
          <div className="mt-6 text-slate-500 py-3 px-4">
            <p>You entered an invalid input. Please check your task item and try again.</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="mt-8 pt-4 sm:pt-6 md:pt-8 lg:pt-10">
            <div className="animate-pulse bg-slate-200 shadow-md rounded-lg h-10 w-full"></div>
          </div>
        )}
      </div>
    )
  }
}

export default TodoApp