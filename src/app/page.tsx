'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Moon, Sun, Mail, Linkedin, Github, Instagram, ExternalLink, Download, Calendar, Award } from 'lucide-react';

const Portfolio = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [activeSection, setActiveSection] = useState('about');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'experience', 'projects', 'certifications', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const techStack = [
    { name: 'React', color: '#61DAFB' },
    { name: 'Next.js', color: '#000000' },
    { name: 'TypeScript', color: '#3178C6' },
    { name: 'MongoDB', color: '#47A248' },
    { name: 'Prisma', color: '#339933' },
    { name: 'JavaScript', color: '#F7DF1E' },
    { name: 'Tailwind CSS', color: '#06B6D4' },
    { name: 'Python', color: '#3776AB' },
    { name: 'SQL', color: '#E34F26' },
    { name: 'Power BI', color: '#F25022' },
    { name: 'Github', color: '#F05032' },

  ];

const experiences = [
  {
    logo: '/Logo/1_TEDx.png',
    alt : 'TEDxPadjadjaran University logo',
    company: 'TEDxPadjadjaran University',
    position: 'Manager of Website',
    duration: 'Feb 2025 - July 2025',
    description: [
      'Led 9-member technical team across Frontend, Backend, and UI/UX divisions to develop Next.js-based career expo website, achieving 1,100+ visitors, 4,788 page views, and 200+ registrations within 20 days of launch.',
      'Managed complete development lifecycle as branch master with 233+ commits, implementing Git workflow practices and delivering production-ready application within 1-month timeline.',
      'Coordinated cross-functional project execution through weekly agile sprints, ensuring stakeholder alignment and exceeding performance targets for user engagement and system reliability.'
    ]
  },
  {
    logo: '/Logo/2_PCE.jpeg',
    alt : 'Padjadjaran Career Expo logo',
    company: 'Padjadjaran Career Expo',
    position: 'Manager of Information Technology',
    duration: 'Jul 2024 - Nov 2024',
    description: [
      'Led 7-member IT division staff across UI/UX, Backend, and Frontend development teams, coordinating with Deputy Manager on job distribution, timeline management, and open recruitment procedures through Agile sprint methodology.',
      'Collaborated with cross-divisional teams and Project Officer to determine website requirements and content specifications, ensuring aligned project objectives and stakeholder expectations.',
      'Served as Project Manager overseeing complete development lifecycle using Next.js framework, delivering production-ready career expo website that generated 220+ registrations from planning through deployment execution.'
    ]
  },
  {
    logo: '/Logo/3_IFFD.jpg',
    alt : 'Informatics Fun Day logo',
    company: 'Informatics Fun Day',
    position: 'Project Officer',
    duration: 'Sep 2024 - Nov 2024',
    description: [
      'Managed a team of over 80 members, ensuring role alignment, timely task completion, and goal-oriented outcomes.',
      'Designed an open recruitment system, structured division schedules, and developed event concepts from inception to execution.',
      'Oversaw operations to foster a comfortable and productive work environment for all staff members.',
      'Achieved a net profit of IDR 2,800,000 for the first time in several years and successfully gathered over 130 participants, including academic members, alumni, and the Informatics Engineering family of Padjadjaran University, meeting the success criteria outlined in the program draft.'
    ]
  },
  {
    logo: '/Logo/4_bem_kema_unpad_logo.jpeg',
    alt : 'BEM Kema Unpad logo',
    company: 'BEM Kema Unpad',
    position: 'Staff of the Data Research and Analysis Bureau',
    duration: 'Mar 2024 - Dec 2024',
    description: [
      'Served as a trusted staff member entrusted with two job roles: the Analysis division and managing the Satu Data Padjadjaran website containing the Kema Unpad student database.',
      'Analyzed thousands of respondents from dozens of mandatory and needs-based surveys from 16 Bureaus and Departments of the BEM Kema Unpad that were conducted.'
    ]
  }
];


  const projects = [
    {
      title: 'TEDxPadjadjaran University Website',
      description: 'Served as PM and Backend Developer for the TEDxPadjadjaran University website built with Next.js, Prisma ORM, and MongoDB, featuring authentication, admin page, landing page, about, event registration, event details, partnership and sponsorship page.',
      image: '/project/1_TEDx.png',
      alt : 'TEDxPadjadjaran University Portolio',
      techStack: ['React', 'Next.js', 'MongoDB', 'Prisma ORM', 'TypeScript', 'Tailwind CSS'],
      link: 'https://tedxpadjadjaranuniversity.com/'
    },
    {
      title: 'Padjadjaran Career Expo',
      description: ' Developed the Padjadjaran Career Expo website using Next.js and MongoDB, featuring a landing page, admin page,about section, event registration, event details, articles, and contact form',
      image: '/project/2_PCE.png',
      alt : 'Padjadjaran Career Expo Portolio',
      techStack: ['Next.js', 'TypeScript', 'Socket.io', 'PostgreSQL'],
      link: 'https://www.padjadjarancareerexpo.id/'
    }
  ];

  const certifications = [
    {
      title: 'AWS Certified Solutions Architect',
      description: 'Sertifikasi arsitektur cloud computing dari Amazon Web Services',
      link: '#'
    },
    {
      title: 'Google Cloud Professional Developer',
      description: 'Sertifikasi pengembangan aplikasi di Google Cloud Platform',
      link: '#'
    },
    {
      title: 'Meta Frontend Developer Professional',
      description: 'Program sertifikasi pengembangan frontend dari Meta (Facebook)',
      link: '#'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 text-gray-900'
    }`}>
      
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-md transition-all duration-300 ${
        darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'
      } border-b`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Portfolio
              </div>
              
              <div className="hidden md:flex space-x-6">
                {['about', 'experience', 'projects', 'certifications', 'contact'].map((section) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 capitalize ${
                      activeSection === section
                        ? 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300'
                        : darkMode 
                          ? 'text-gray-300 hover:text-white hover:bg-slate-800' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {section}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                darkMode 
                  ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* About Section */}
      <section id="about" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="relative inline-block mb-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-1 mx-auto">
                <div className={`w-full h-full rounded-full flex items-center justify-center text-4xl ${
                  darkMode ? 'bg-slate-900' : 'bg-white'
                }`}>
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                      src="/dokumentasi/zhafran.png"
                      alt="Foto Zhafran"
                      fill
                      sizes="128px"
                      className="rounded-full object-cover w-full h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Muhammad Zhafran Shiddiq
            </h1>
            <p className="text-xl mb-2 text-gray-600 dark:text-gray-300">Project Manager & Data Analyst</p>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
                Project Manager and Data Analyst with 3.92 GPA in Informatics Engineering. Successfully managed website development projects while maintaining strong analytical skills in SQL, Power BI, and data visualization. Proven ability to lead technical teams and transform complex data into actionable insights. Open to roles leveraging both project management and analytical capabilities.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <a href="https://drive.google.com/file/d/1CYHAd_wOgN9cUcM4XFtoYb5ek5QwhTLs/view?usp=sharing" target="_blank" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200">
                <Download size={20} />
                Download CV
              </a>
              <a href="https://www.linkedin.com/in/mzhafrans/" target="_blank" className="flex items-center gap-2 bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-6 py-3 rounded-lg hover:bg-blue-200 dark:hover:bg-slate-700 transition-colors duration-200">
                <Linkedin size={20} />
                LinkedIn
              </a>
              <a href="https://github.com/Muhammad-ZhafranShiddiq" target="_blank" className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors duration-200">
                <Github size={20} />
                GitHub
              </a>
            </div>
          </div>
          
          {/* Tech Stack */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-8">Skills & Technologies</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {techStack.map((tech, index) => (
                <div key={index} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 hover:scale-105 ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700 hover:border-blue-500' 
                    : 'bg-white border-gray-200 hover:border-blue-400'
                }`}>
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: tech.color }}
                  ></div>
                  <span className="font-medium">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Experience</h2>
          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <div key={index} className={`p-6 rounded-lg border transition-all duration-300 hover:shadow-lg ${
                darkMode 
                  ? 'bg-slate-800/50 border-slate-700 hover:border-blue-500' 
                  : 'bg-white border-gray-200 hover:border-blue-300'
              }`}>
                <div className="flex items-start gap-4">
                  <div className="text-3xl">
                  <Image
                    src={exp.logo}
                    alt={exp.company + ' logo'}
                    width={48}
                    height={48}
                    className="rounded-full object-cover w-12 h-12"
                  />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{exp.position}</h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">{exp.company}</p>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-3">
                      <Calendar size={16} />
                      {exp.duration}
                    </div>
                                        {Array.isArray(exp.description) ? (
                      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                        {exp.description.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300">{exp.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div key={index} className={`rounded-lg border overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                darkMode 
                  ? 'bg-slate-800/50 border-slate-700 hover:border-blue-500' 
                  : 'bg-white border-gray-200 hover:border-blue-300'
              }`}>
                <div className={`h-48 flex items-center justify-center text-6xl ${
                  darkMode ? 'bg-slate-700' : 'bg-gray-100'
                }`}>
                  <div className="relative h-48 w-full">
                    <Image
                      src={project.image}
                      alt={project.title + ' image'}
                      fill
                      className="object-contain w-full h-full"
                    />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.techStack.map((tech, techIndex) => (
                      <span key={techIndex} className={`px-2 py-1 text-xs rounded-full ${
                        darkMode 
                          ? 'bg-blue-900 text-blue-300' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {tech}
                      </span>
                    ))}
                  </div>
                  <a href={project.link} target="_blank" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                    <ExternalLink size={16} />
                    View Project
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section id="certifications" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Certifications</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert, index) => (
              <div key={index} className={`p-6 rounded-lg border transition-all duration-300 hover:shadow-lg ${
                darkMode 
                  ? 'bg-slate-800/50 border-slate-700 hover:border-blue-500' 
                  : 'bg-white border-gray-200 hover:border-blue-300'
              }`}>
                <div className="flex items-start gap-3 mb-4">
                  <Award className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-bold mb-2">{cert.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{cert.description}</p>
                    <a href={cert.link} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm">
                      <ExternalLink size={14} />
                      View Certificate
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Contact Me</h2>
          <p className="text-lg mb-8 text-gray-600 dark:text-gray-400">
            Interested in working together or have questions? Let's connect!
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=m.zhafran.s17@gmail.com" target="_blank" className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 ${
              darkMode 
                ? 'bg-slate-800 border border-slate-700 hover:border-blue-500' 
                : 'bg-white border border-gray-200 hover:border-blue-300'
            }`}>
              <Mail className="text-red-500" size={24} />
              <span>Email</span>
            </a>
            
            <a href="https://linkedin.com/in/mzhafrans" target="_blank" className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 ${
              darkMode 
                ? 'bg-slate-800 border border-slate-700 hover:border-blue-500' 
                : 'bg-white border border-gray-200 hover:border-blue-300'
            }`}>
              <Linkedin className="text-blue-600" size={24} />
              <span>LinkedIn</span>
            </a>
            
            <a href="https://www.instagram.com/_zhafrans/" target="_blank" className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 ${
              darkMode 
                ? 'bg-slate-800 border border-slate-700 hover:border-blue-500' 
                : 'bg-white border border-gray-200 hover:border-blue-300'
            }`}>
              <Instagram className="text-pink-500" size={24} />
              <span>Instagram</span>
            </a>
            
            <a href="https://github.com/Muhammad-ZhafranShiddiq" target="_blank" className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 ${
              darkMode 
                ? 'bg-slate-800 border border-slate-700 hover:border-blue-500' 
                : 'bg-white border border-gray-200 hover:border-blue-300'
            }`}>
              <Github className="text-gray-700 dark:text-gray-300" size={24} />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-8 px-4 sm:px-6 lg:px-8 ${
        darkMode ? 'border-slate-700' : 'border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © 2025 Muhammad Zhafran Shiddiq. Built with Next.js & React.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;