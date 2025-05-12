import { useState, useEffect, useRef } from 'react';
import useTypingAnimation from '../hooks/useTypingAnimation';

// Terminal colors
const COLORS = {
  bg: "#121212",
  text: "#f8f8f2",
  prompt: "#50fa7b",
  user: "#8be9fd",
  hostname: "#bd93f9",
  path: "#50fa7b",
  command: "#f8f8f2",
  output: "#f8f8f2",
  error: "#ff5555",
  title: "#f8f8f2",
};

const Terminal = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [username] = useState('guest');
  const [hostname] = useState('portfolio');
  const [currentDir] = useState('~');
  const [initialized, setInitialized] = useState(false);
  const [showTypingWelcome, setShowTypingWelcome] = useState(true);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // Welcome messages
  const welcomeMessages = [
    "Welcome to Valentino Farish Adrian portfolio!",
    "Type 'help' for available commands"
  ];
  
  // Generate initial welcome message with typing animation
  const typedWelcome = useTypingAnimation(welcomeMessages, 40);

  // Available commands
  const commands = {
    help: () => ({
      type: 'text',
      content: [
        "Available commands:",
        "about     - Learn more about me",
        "projects  - View my featured projects",
        "skills    - See my technical skills",
        "contact   - How to reach me",
        "github    - Visit my GitHub profile",
        "linkedin  - Visit my LinkedIn profile",
        "cv        - Download my CV",
        "clear     - Clear the terminal",
        "whoami    - Display current user",
        "pwd       - Print working directory",
        "ls        - List directory contents",
        "date      - Display current date and time",
        "echo      - Display a message"
      ]
    }),
    about: () => ({
        type: 'text',
        content: [
          "==========================",
          "Valentino Farish Adrian",
          "Computer Engineering Undergrad Student",
          "==========================",
          "I'm a highly motivated Computer Engineering undergraduate at ",
          "Universitas Indonesia with strong experience in multimedia, leadership,",
          "and technical problem-solving.",
          "Former Vice Head of Multimedia Bureau at BEM UI, where I demonstrated", 
          "exceptional teamwork and project management skills.",
          "Passionate about software engineering, networking, and IoT systems.",
          "Adept at creating innovative solutions, particularly in real-time IoT applications and network security.",
          "Proactively engages in technical development and collaborative projects to deliver impactful results.",
          "=========================="
        ]
      }),
      projects: () => ({
        type: 'text',
        content: [
          "==========================",
          "PROJECTS",
          "==========================",
          "CLI Portfolio",
          "A terminal-style portfolio website",
          "built with React and Tailwind CSS",
          "=========================="
        ]
      }),
      skills: () => ({
        type: 'text',
        content: [
          "==========================",
          "TECHNICAL SKILLS",
          "==========================",
          "Languages:",
          "Java, C, C++, JavaScript, Python, HTML/CSS",
          "--------------------------",
          "Frontend:",
          "React, Tailwind CSS, Bootstrap",
          "--------------------------",
          "Backend:",
          "Node.js, Express, MongoDB, SQL",
          "--------------------------",
          "Tools & Other:",
          "Wireshark, Kali Linux, Git, Cisco Packet Tracer",
          "=========================="
        ]
      }),
      contact: () => ({
        type: 'text',
        content: [
          "==========================",
          "CONTACT INFORMATION",
          "==========================",
          "Email:",
          "vfarish28@gmail.com",
          "--------------------------",
          "Instagram:",
          "@valentinofarish",
          "==========================",
          "",
          "Feel free to reach out for collaborations or opportunities!"
        ]
      }),
    github: () => ({
      type: 'link',
      url: "https://github.com/ValentinoFarishAdrian"
    }),
    linkedin: () => ({
      type: 'link',
      url: "https://www.linkedin.com/in/valentino-farish-adrian/"
    }),
    cv: () => ({
        type: 'link',
        url: "https://drive.google.com/drive/folders/1VtsucPCF-VEaGWOZ68Fu352eLhhK7Uxj?usp=sharing"
      }),
    clear: () => ({
      type: 'clear'
    }),
    whoami: () => ({
      type: 'text',
      content: [username]
    }),
    pwd: () => ({
      type: 'text',
      content: [`/home/${username}${currentDir === '~' ? '' : currentDir}`]
    }),
    ls: () => ({
      type: 'text',
      content: ["about.txt  projects.md  skills.json  contact.info  .hidden"]
    }),
    date: () => ({
      type: 'text',
      content: [new Date().toString()]
    }),
    echo: (args) => ({
      type: 'text',
      content: [args || ""]
    })
  };

  // Handle command submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const fullInput = input.trim();
    const [cmd, ...args] = fullInput.split(' ');
    const argsStr = args.join(' ');
    
    if (fullInput) {
      // Add command to history
      setHistory(prev => [...prev, fullInput]);
      setHistoryIndex(-1);
      
      // Process command
      if (commands[cmd]) {
        const response = commands[cmd](argsStr);
        
        if (response.type === 'clear') {
          // Clear output
          setOutput([]);
          // Reset welcome message typing animation
          setShowTypingWelcome(true);
          // Re-add welcome message with typing animation
          setTimeout(() => {
            setOutput([{ 
              cmd: '', 
              response: { 
                type: 'text', 
                content: typedWelcome
              } 
            }]);
          }, 100);
        } else if (response.type === 'link') {
          // Handle external links properly
          try {
            const newWindow = window.open(response.url, '_blank', 'noopener,noreferrer');
            if (newWindow) newWindow.opener = null;
            setOutput(prev => [...prev, { 
              cmd: fullInput, 
              response: { 
                type: 'text', 
                content: [`Opening ${response.url} in a new tab...`] 
              } 
            }]);
          } catch (error) {
            setOutput(prev => [...prev, { 
              cmd: fullInput, 
              response: { 
                type: 'text', 
                content: [`Failed to open ${response.url}: ${error.message}`] 
              } 
            }]);
          }
        } else {
          // Handle normal text responses
          setOutput(prev => [...prev, { cmd: fullInput, response }]);
        }
      } else {
        // Command not found
        setOutput(prev => [...prev, { 
          cmd: fullInput, 
          response: { 
            type: 'text', 
            content: [`Command not found: ${cmd}. Type 'help' for available commands.`] 
          } 
        }]);
      }
    }
    
    setInput('');
  };

  // Handle key presses for history navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp' && history.length > 0) {
      const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
      setHistoryIndex(newIndex);
      setInput(history[history.length - 1 - newIndex] || '');
    } else if (e.key === 'ArrowDown') {
      const newIndex = historyIndex > 0 ? historyIndex - 1 : -1;
      setHistoryIndex(newIndex);
      setInput(newIndex === -1 ? '' : history[history.length - 1 - newIndex]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion (you can enhance this)
      const cmdStart = input.toLowerCase();
      const possibleCommands = Object.keys(commands).filter(cmd => cmd.startsWith(cmdStart));
      
      if (possibleCommands.length === 1) {
        setInput(possibleCommands[0]);
      }
    }
  };

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTo({
        top: terminalRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [output]);

  // Show welcome message on initial render
  useEffect(() => {
    if (!initialized) {
      setOutput([{ 
        cmd: '', 
        response: { 
          type: 'text', 
          content: typedWelcome 
        } 
      }]);
      setInitialized(true);
    }
  }, []);

  // Update typing animation
  useEffect(() => {
    if (initialized && showTypingWelcome) {
      // Update the welcome message as it's being typed
      setOutput([{ 
        cmd: '', 
        response: { 
          type: 'text', 
          content: typedWelcome 
        } 
      }]);
      
      // Once the typing is complete and we've received the full welcome messages,
      // stop updating to prevent infinite re-renders
      if (typedWelcome.length === welcomeMessages.length && 
          typedWelcome.every((msg, i) => msg === welcomeMessages[i])) {
        setShowTypingWelcome(false);
      }
    }
  }, [typedWelcome, initialized, showTypingWelcome]);

  // Focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Keep focus on input when clicking anywhere in the terminal
  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div 
      className="min-h-screen bg-gray-900 text-gray-100 p-4 font-mono text-sm md:text-base flex flex-col"
      onClick={handleTerminalClick}
      style={{ backgroundColor: COLORS.bg }}
    >
      {/* Terminal window with title bar */}
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col border border-gray-700 rounded overflow-hidden shadow-lg">
        {/* Title bar */}
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center">
            <div className="flex space-x-2 mr-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-gray-100 text-xs md:text-sm" style={{ color: COLORS.title }}>
              {username}@{hostname}: {currentDir}
            </span>
          </div>
          <div className="text-xs text-gray-400">
            bash - {Math.floor(Math.random() * 100)}x{Math.floor(Math.random() * 30)}
          </div>
        </div>
        
        {/* Terminal content */}
        <div 
          ref={terminalRef}
          className="flex-1 p-4 overflow-y-auto bg-gray-900"
          style={{ backgroundColor: COLORS.bg }}
        >
          {/* Command history */}
          <div className="mb-2">
            {output.map((item, i) => (
              <div key={i} className="mb-3">
                {item.cmd && (
                  <div className="flex">
                    <span style={{ color: COLORS.user }} className="mr-1">{username}@{hostname}</span>
                    <span style={{ color: COLORS.text }} className="mr-1">:</span>
                    <span style={{ color: COLORS.path }} className="mr-1">{currentDir}</span>
                    <span style={{ color: COLORS.text }} className="mr-1">$</span>
                    <span style={{ color: COLORS.command }} className="ml-1">{item.cmd}</span>
                  </div>
                )}
                <div className="mt-1 pl-0">
                  {item.response.content && 
                    item.response.content.map((line, j) => (
                      <div 
                        key={j} 
                        className="leading-tight whitespace-pre"
                        style={{ color: COLORS.output }}
                      >
                        {line}
                      </div>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
          
          {/* Command input */}
          <form onSubmit={handleSubmit} className="flex items-center">
            <span style={{ color: COLORS.user }} className="mr-1">{username}@{hostname}</span>
            <span style={{ color: COLORS.text }} className="mr-1">:</span>
            <span style={{ color: COLORS.path }} className="mr-1">{currentDir}</span>
            <span style={{ color: COLORS.text }} className="mr-1">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none flex-1 ml-1 text-white"
              style={{ color: COLORS.command, backgroundColor: 'transparent', caretColor: COLORS.text, border: 'none' }}
              autoFocus
              spellCheck="false"
            />
          </form>
        </div>
      </div>

      {/* Footer with system information */}
      <div className="max-w-4xl mx-auto w-full mt-2 text-xs text-gray-400 flex justify-between">
        <div>React v18.2.0 | Node v18.19.1</div>
        <div>{new Date().toLocaleDateString()}</div>
      </div>
    </div>
  );
};

export default Terminal;