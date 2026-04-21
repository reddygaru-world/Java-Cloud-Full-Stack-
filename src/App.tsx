import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  ChevronRight, 
  RefreshCcw, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft,
  Timer,
  Layout,
  Cpu,
  Home,
  BookOpen,
  Send
} from 'lucide-react';
import devOpsData from './data/DevOps_MCQs.json';
import htmlCssData from './data/HTML_CSS_mcqs.json';
import javaData from './data/Java_MCQs.json';
import jsNodeData from './data/JavaScript_NodeJS_MCQs.json';
import mongoData from './data/MongoDB_MCQs.json';
import springData from './data/Spring_Core_Spring_Boot_MCQs.json';
import tsData from './data/TypeScript_MCQs.json';

// Types
interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: Question[];
}

type AppTab = 'HOME' | 'LEARNING' | 'PRACTICE';
type QuizStatus = 'IDLE' | 'QUIZ' | 'RESULTS';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('HOME');
  const [quizStatus, setQuizStatus] = useState<QuizStatus>('IDLE');
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [learningQuizIndex, setLearningQuizIndex] = useState<number | null>(null);
  
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [score, setScore] = useState(0);
  
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [shakingIdx, setShakingIdx] = useState<number | null>(null);
  
  const quizzes = useMemo(() => {
    const rawData = [
      { id: 'java', title: 'Java Mastery', description: 'Advanced Java concepts, JVM, and OOP.', category: 'Backend', data: javaData },
      { id: 'js-node', title: 'JS & Node.js', description: 'Fullstack JavaScript from frontend to server.', category: 'Fullstack', data: jsNodeData },
      { id: 'ts', title: 'TypeScript', description: 'Type safety, interfaces, and advanced TS features.', category: 'Frontend', data: tsData },
      { id: 'html-css', title: 'HTML & CSS', description: 'Modern layout techniques and semantic web.', category: 'Frontend', data: htmlCssData },
      { id: 'mongo', title: 'MongoDB', description: 'NoSQL databases and document orchestration.', category: 'Database', data: mongoData },
      { id: 'spring', title: 'Spring Boot', description: 'Enterprise Java with Spring framework.', category: 'Backend', data: springData },
      { id: 'devops', title: 'DevOps & Git', description: 'Pipelines, git workflows, and automation.', category: 'DevOps', data: devOpsData },
    ];

    return rawData.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      questions: item.data.map((q: any, qIdx: number) => {
        const correctStr = String(q.correct || '').trim();
        const options = Array.isArray(q.options) ? q.options : [];
        const foundIdx = options.findIndex((opt: any) => String(opt).trim() === correctStr);
        
        return {
          id: qIdx,
          text: q.question || 'Question text missing',
          options: options,
          correctAnswer: foundIdx !== -1 ? foundIdx : 0 // Default to first option if not found
        };
      })
    })) as Quiz[];
  }, []);
  const activeQuiz = quizzes[activeQuizIndex];
  const answeredCount = answers.filter(a => a !== null).length;
  const progress = currentQuestions.length > 0 ? (answeredCount / currentQuestions.length) * 100 : 0;

  const handleStartPractice = (index: number) => {
    const quiz = quizzes[index];
    const shuffled = [...quiz.questions].sort(() => Math.random() - 0.5);
    
    setCurrentQuestions(shuffled);
    setActiveQuizIndex(index);
    setQuizStatus('QUIZ');
    setAnswers(new Array(shuffled.length).fill(null));
    setScore(0);
  };

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (answers[qIdx] !== null) return;
    
    const newAnswers = [...answers];
    newAnswers[qIdx] = optIdx;
    setAnswers(newAnswers);

    const question = currentQuestions[qIdx];
    const isCorrect = optIdx === question.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      setShakingIdx(qIdx);
      setTimeout(() => setShakingIdx(null), 400);
    }
  };

  const resetQuiz = () => {
    setQuizStatus('IDLE');
  };

  const NavigationBar = () => {
    // Hide navigation if inside a learning set or actively practicing
    if (learningQuizIndex !== null || (activeTab === 'PRACTICE' && quizStatus === 'QUIZ')) {
      return null;
    }

    return (
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-card px-2 py-2 flex items-center gap-1 shadow-xl border-white/50 backdrop-blur-2xl">
        {[
          { id: 'HOME', label: 'Home', icon: Home },
          { id: 'LEARNING', label: 'Learning', icon: BookOpen },
          { id: 'PRACTICE', label: 'Practice', icon: Send },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as AppTab);
              setQuizStatus('IDLE');
              setLearningQuizIndex(null);
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === tab.id 
                ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200' 
                : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>
    );
  };

  const isImmersive = learningQuizIndex !== null || (activeTab === 'PRACTICE' && quizStatus === 'QUIZ');

  return (
    <div className={`relative min-h-screen p-4 md:p-8 flex flex-col items-center transition-all duration-500 ${isImmersive ? 'pt-4 md:pt-8' : 'pt-24 md:pt-32'}`}>
      <div className="atmosphere" />
      <NavigationBar />
      
      <AnimatePresence mode="wait">
        {activeTab === 'HOME' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl space-y-12 py-12"
          >
            <div className="text-center space-y-4">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex p-4 bg-zinc-900 text-white rounded-3xl"
              >
                <Cpu size={32} />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-sans font-black tracking-tight text-zinc-900">
                Quiz<span className="text-zinc-500 italic font-display">Wise</span>
              </h1>
              <p className="text-zinc-500 text-base max-w-xl mx-auto leading-relaxed">
                Your ultimate educational companion. Master any subject through dedicated study paths and real-time performance testing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="glass-card p-8 space-y-4">
                <div className="text-emerald-600 bg-emerald-100 w-12 h-12 rounded-2xl flex items-center justify-center">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-lg font-sans font-bold">Concept Mastery</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">
                  Deep dive into core concepts. Browse through topic-specific question sets with answers highlighted for efficient learning.
                </p>
                <button onClick={() => setActiveTab('LEARNING')} className="button-primary w-full shadow-none border border-zinc-200 !bg-transparent !text-zinc-900 hover:!bg-zinc-50">
                  Enter Learning Mode
                </button>
              </div>
              <div className="glass-card p-8 space-y-4">
                <div className="text-blue-600 bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center">
                  <Send size={24} />
                </div>
                <h3 className="text-lg font-sans font-bold">Skills Testing</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">
                  Challenge yourself with timed practice runs. Get instant feedback on your answers and a complete analysis of your results.
                </p>
                <button onClick={() => setActiveTab('PRACTICE')} className="button-primary w-full">
                  Begin Practice
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'LEARNING' && (
          <motion.div 
            key="learning"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-4xl space-y-8"
          >
            {learningQuizIndex === null ? (
              <div className="space-y-12">
                <div className="text-center space-y-2 mb-4">
                  <h2 className="text-2xl font-sans font-bold">Browse Topics</h2>
                  <p className="text-zinc-500 text-sm">Choose a subject to see detailed questions and answers.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {quizzes.map((quiz, idx) => (
                    <motion.div 
                      key={quiz.id}
                      onClick={() => setLearningQuizIndex(idx)}
                      whileHover={{ y: -4, backgroundColor: "rgba(255, 255, 255, 0.6)" }}
                      className="glass-card p-6 cursor-pointer hover:shadow-lg transition-all border-white/40 group bg-white/40 border-2 border-transparent hover:border-zinc-200"
                    >
                      <span className="inline-block px-2.5 py-1 bg-zinc-100 text-[10px] font-bold uppercase tracking-wider text-zinc-500 rounded-md mb-4">
                        {quiz.category}
                      </span>
                      <h3 className="text-lg font-sans font-bold mb-2 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{quiz.title}</h3>
                      <p className="text-xs text-zinc-500 mb-6 leading-relaxed">{quiz.description}</p>
                      <div className="flex items-center text-xs font-bold text-zinc-900">
                        View Study Set <ChevronRight size={14} className="ml-1 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8 pb-32">
                <div className="flex items-center justify-between sticky top-0 z-40 bg-zinc-50/90 backdrop-blur-xl py-6 -mx-4 px-4 border-b border-zinc-200/50 shadow-sm">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => setLearningQuizIndex(null)}
                      className="p-3 bg-white border border-zinc-200 rounded-2xl text-zinc-400 hover:text-zinc-900 hover:border-zinc-900 transition-all shadow-sm"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div>
                      <h2 className="text-2xl font-sans font-bold leading-tight">{quizzes[learningQuizIndex].title}</h2>
                      <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mt-1">Study Guide • Learning Mode</p>
                    </div>
                  </div>
                  <div className="hidden md:flex px-4 py-2 bg-emerald-50 rounded-xl text-emerald-700 text-xs font-bold items-center gap-2 border border-emerald-100">
                    <CheckCircle2 size={16} />
                    Auto-Revealed Mode
                  </div>
                </div>

                <div className="space-y-6">
                  {quizzes[learningQuizIndex].questions.map((q, i) => (
                    <motion.div 
                      key={q.id} 
                      className="glass-card p-6 space-y-6 border-2 border-transparent hover:border-zinc-100 transition-all"
                      whileHover={{ y: -2 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-sm font-bold mt-1">
                          {i + 1}
                        </span>
                        <h4 className="text-sm md:text-base font-bold pt-0.5 font-sans leading-relaxed text-zinc-800">{q.text}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-0 md:pl-12">
                        {q.options.map((option, optIdx) => (
                          <div 
                            key={optIdx}
                            className={`p-3 rounded-xl border-2 text-xs md:text-sm font-medium flex items-center gap-3 ${
                              optIdx === q.correctAnswer 
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-900' 
                                : 'border-zinc-100 bg-zinc-50/30 text-zinc-400'
                            }`}
                          >
                            <span className="flex-shrink-0 w-5 h-5 rounded-md bg-white border border-current flex items-center justify-center text-[10px] font-black uppercase">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{option}</span>
                            {optIdx === q.correctAnswer && (
                              <CheckCircle2 size={16} className="text-emerald-500 stroke-[2.5]" />
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'PRACTICE' && (
          <motion.div 
            key="practice"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full max-w-4xl"
          >
            {quizStatus === 'IDLE' && (
              <div className="space-y-12">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-sans font-bold">Challenge Your Knowledge</h2>
                  <p className="text-zinc-500 text-sm">Pick a topic and see if you can get a perfect score.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {quizzes.map((quiz, idx) => (
                    <motion.div 
                      key={quiz.id}
                      whileHover={{ y: -4, backgroundColor: "rgba(255, 255, 255, 0.6)" }}
                      className="glass-card p-6 flex flex-col justify-between hover:shadow-lg transition-all border-white/40 border-2 border-transparent hover:border-zinc-200"
                    >
                      <div className="space-y-4">
                        <span className="inline-block px-2.5 py-1 bg-zinc-100 text-[10px] font-bold uppercase tracking-wider text-zinc-500 rounded-md">
                          {quiz.category}
                        </span>
                        <h3 className="text-lg font-sans font-bold leading-tight uppercase tracking-tight">{quiz.title}</h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          {quiz.description}
                        </p>
                      </div>
                      <div className="pt-8 flex items-center justify-between border-t border-zinc-100/50 mt-4">
                        <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                          <Timer size={14} />
                          {quiz.questions.length} questions
                        </div>
                        <button 
                          onClick={() => handleStartPractice(idx)}
                          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors"
                        >
                          Start Test
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {quizStatus === 'QUIZ' && (
              <div className="w-full max-w-3xl mx-auto space-y-6 pb-20">
                <div className="flex items-center justify-between sticky top-0 z-40 bg-zinc-50/90 backdrop-blur-xl py-6 -mx-4 px-4 border-b border-zinc-200/50 shadow-sm mb-4">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={resetQuiz}
                      className="p-3 bg-white border border-zinc-200 rounded-2xl text-zinc-400 hover:text-zinc-900 hover:border-zinc-900 transition-all shadow-sm"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div>
                      <h3 className="text-lg font-sans font-bold leading-tight">{activeQuiz.title}</h3>
                      <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Test • Live Session</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Score</span>
                      <p className="text-xl font-display font-bold text-emerald-600 leading-none">
                        {score}
                      </p>
                    </div>
                    <div className="text-right border-l border-zinc-200 pl-6">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Ans</span>
                      <p className="text-xl font-display font-bold leading-none">
                        {answeredCount}<span className="text-zinc-300 font-normal">/{currentQuestions.length}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden mb-12">
                  <motion.div 
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-zinc-900"
                  />
                </div>

                <div className="space-y-16">
                  {currentQuestions.map((question, qIdx) => {
                    const userAnswer = answers[qIdx];
                    const isAnswered = userAnswer !== null;
                    
                    return (
                      <motion.div 
                        key={question.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -2 }}
                        viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
                        className={`glass-card p-6 md:p-10 space-y-6 transition-all ${shakingIdx === qIdx ? 'shake' : ''} max-w-3xl mx-auto shadow-lg border-2 border-transparent hover:border-zinc-100`}
                      >
                        <div className="flex items-start gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-sm font-bold mt-1">
                            {qIdx + 1}
                          </span>
                          <h2 className="text-base md:text-lg font-sans font-bold leading-relaxed text-zinc-800">
                            {question.text}
                          </h2>
                        </div>

                        <div className="space-y-3 pl-0 md:pl-12">
                          {question.options.map((option, optIdx) => {
                            const isSelected = userAnswer === optIdx;
                            const isCorrect = isAnswered && optIdx === question.correctAnswer;
                            const isWrong = isAnswered && isSelected && optIdx !== question.correctAnswer;
                            
                            return (
                              <motion.button
                                key={optIdx}
                                disabled={isAnswered}
                                whileHover={{ x: isAnswered ? 0 : 6 }}
                                onClick={() => handleSelectOption(qIdx, optIdx)}
                                className={`answer-option py-3.5 px-5 !gap-4 ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct text-emerald-900' : ''} ${isWrong ? 'incorrect text-rose-900' : ''}`}
                              >
                                <span className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center text-xs font-black uppercase transition-colors ${
                                  isSelected ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 text-zinc-400'
                                } ${isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : ''} ${isWrong ? 'border-rose-500 bg-rose-500 text-white' : ''}`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="flex-1 text-xs md:text-sm font-semibold">{option}</span>
                                {isCorrect && <CheckCircle2 className="text-emerald-500" size={20} />}
                                {isWrong && <XCircle className="text-rose-500" size={20} />}
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="pt-12 flex justify-center">
                  <button 
                    onClick={() => setQuizStatus('RESULTS')}
                    className="button-primary px-12 py-5 text-xl font-black rounded-3xl"
                  >
                    Finish and See Results
                    <ChevronRight size={24} className="ml-2" />
                  </button>
                </div>
              </div>
            )}

            {quizStatus === 'RESULTS' && (
              <div className="w-full max-w-xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <motion.div 
                      initial={{ rotate: -20, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ type: 'spring', damping: 10 }}
                      className="p-5 bg-amber-100 text-amber-600 rounded-full inline-flex relative z-10"
                    >
                      <Trophy size={48} />
                    </motion.div>
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-amber-400 blur-2xl rounded-full"
                    />
                  </div>
                  <h2 className="text-2xl font-sans font-bold">Quiz Performance</h2>
                  <p className="text-zinc-500 text-sm">Evaluation complete. Here is your summary.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-6">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Questions Correct</p>
                    <p className="text-5xl font-display font-black pt-2 text-zinc-900">
                      {score}<span className="text-xl text-zinc-300 font-normal">/{currentQuestions.length}</span>
                    </p>
                  </div>
                  <div className="glass-card p-6">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Accuracy Rating</p>
                    <p className="text-5xl font-display font-black pt-2 text-zinc-900">
                      {currentQuestions.length > 0 ? Math.round((score / currentQuestions.length) * 100) : 0}%
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 px-2 flex items-center gap-2">
                    <Layout size={14} />
                    Session Analysis
                  </h3>
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {currentQuestions.map((q, i) => {
                      const userAnswer = answers[i];
                      const isCorrect = userAnswer === q.correctAnswer;
                      return (
                        <div key={q.id} className={`p-4 rounded-2xl border-2 transition-all ${isCorrect ? 'bg-emerald-50/40 border-emerald-100/50' : 'bg-rose-50/40 border-rose-100/50'}`}>
                          <p className="text-xs md:text-sm font-bold mb-3">{q.text}</p>
                          <div className="flex flex-col gap-2">
                            <div className={`text-xs md:text-sm flex items-center gap-2 font-semibold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                              Your Answer: <span className="opacity-60">({String.fromCharCode(65 + (userAnswer ?? 0))})</span> {userAnswer !== null ? q.options[userAnswer] : 'Skipped'}
                            </div>
                            {!isCorrect && (
                              <div className="text-emerald-700 text-sm flex items-center gap-2 font-semibold pl-6 opacity-75">
                                <CheckCircle2 size={16} />
                                Correct Answer: <span className="opacity-60">({String.fromCharCode(65 + q.correctAnswer)})</span> {q.options[q.correctAnswer]}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => handleStartPractice(activeQuizIndex)}
                    className="button-primary flex-1 py-4 group"
                  >
                    Retake Challenge
                    <RefreshCcw size={18} className="ml-2 transition-transform group-hover:rotate-180 duration-500" />
                  </button>
                  <button 
                    onClick={resetQuiz}
                    className="px-8 py-4 rounded-2xl bg-white border border-zinc-200 text-zinc-900 font-bold hover:bg-zinc-100 transition-all flex-1"
                  >
                    Exit to Menu
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
