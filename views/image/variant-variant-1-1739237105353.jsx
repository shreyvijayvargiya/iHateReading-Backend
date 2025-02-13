import React from "react";

function ComponentName(props, show) {
    const [isLoading] = useState(false);  
    useEffect(() => {  
        if (isLoading === true && !show) {  
            document.querySelector('#component').style.display = 'none';  
        } else if (!isLoading) {  
            document.querySelector('#component').style.display = 'block';  
        }  
    }, [isLoading]);  

    return (
        
            Welcome to Modern Dark Tech  
            Experience the future of dark technology with our cutting-edge solutions.  
            
                 show(false)}
                    className="px-4 py-2 rounded-full bg-cyan-400 hover:bg-cyan-500 transition-colors"
                >
                    ✨
                  
                Loading
                Please wait while our component loads...  
              
            
                
                    
                        Modern Dark Tech Solutions
                      
                    Experience the latest dark tech solutions for your modern applications.
                  
                 show(true)}
                    className="absolute top-2 right-2 bg-rose-500 hover:bg-rose-600 transition-colors"
                >
                    ✨
                  
              
          
    )  
}

export default ComponentName