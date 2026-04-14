import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth, type UserRole } from "@/contexts/AuthContext";

const roles: { role: UserRole; icon: string; label: string; sub: string }[] = [
  { role: "Employee", icon: "👤", label: "Employee", sub: "Team member" },
  { role: "Manager", icon: "👔", label: "Manager", sub: "Team lead" },
  { role: "Admin", icon: "⚙️", label: "Admin", sub: "Full access" },
];

const features = [
  { icon: "🤖", text: "AI-powered learning paths and instant answers" },
  { icon: "📊", text: "Real-time progress tracking and KPI monitoring" },
  { icon: "🛕", text: "Department-specific courses from namandarshan.com" },
  { icon: "📅", text: "Leave management, holidays & project tracking" },
];

const Login: React.FC = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("Employee");
  const [email, setEmail] = useState("priya.sharma@namandarshan.com");
  const [password, setPassword] = useState("password");
  const [userName, setUserName] = useState("Priya Sharma");
  const [department, setDepartment] = useState("General");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, userName, password, department, selectedRole);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 bg-deep flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-saffron/10" />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-gold/8" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-saffron to-gold flex items-center justify-center text-xl">🛕</div>
          <div>
            <div className="text-lg font-bold text-primary-foreground">NamanDarshan</div>
            <div className="text-[11px] text-saffron-mid tracking-widest">AI Learning Platform</div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <h1 className="text-[32px] font-bold text-primary-foreground leading-tight mb-3">
            Your <span className="text-saffron-mid">sacred</span> path to professional growth
          </h1>
          <p className="text-[13px] text-primary-foreground/50 leading-relaxed">
            AI-powered LMS built for the NamanDarshan team. Learn smarter, track progress, and serve devotees better.
          </p>
        </motion.div>

        <div className="relative z-10 flex flex-col gap-2.5">
          {features.map((f, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-2.5 text-xs text-primary-foreground/70"
            >
              <div className="w-7 h-7 rounded-lg bg-primary-foreground/5 flex items-center justify-center text-sm flex-shrink-0">{f.icon}</div>
              {f.text}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[420px]"
        >
          <h2 className="text-2xl font-bold mb-1.5">Welcome back 🙏</h2>
          <p className="text-sm text-muted-foreground mb-7">Select your role and sign in to continue</p>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {roles.map(r => (
              <button
                key={r.role}
                onClick={() => setSelectedRole(r.role)}
                className={`p-3.5 rounded-lg border-[1.5px] text-center transition-all ${
                  selectedRole === r.role
                    ? "border-saffron bg-saffron-light"
                    : "border-border bg-card hover:border-saffron/50"
                }`}
              >
                <div className="text-[22px] mb-1.5">{r.icon}</div>
                <span className="text-[11px] font-semibold block">{r.label}</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">{r.sub}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-3.5">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@namandarshan.com"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm bg-card focus:border-saffron outline-none transition-colors"
              />
            </div>
            <div className="mb-3.5">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-lg text-sm bg-card focus:border-saffron outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-saffron text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity mt-1"
            >
              Sign in to LMS →
            </button>
          </form>
          <p className="text-center text-[11px] text-muted-foreground mt-3.5">
            Demo: any credentials work. Role selection changes dashboard view.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
