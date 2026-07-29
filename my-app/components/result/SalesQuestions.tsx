'use client';

import React, { useState } from 'react';
import { QuestionHook } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, Copy, Check, HelpCircle, MessageSquare, ShieldAlert, Target } from 'lucide-react';

interface SalesQuestionsProps {
  questions: QuestionHook[];
}

export const SalesQuestions: React.FC<SalesQuestionsProps> = ({ questions }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryBadge = (cat: QuestionHook['category']) => {
    switch (cat) {
      case 'Pain Point':
        return <Badge variant="danger" size="sm">Pain Point</Badge>;
      case 'Value Proposition':
        return <Badge variant="success" size="sm">Value Prop</Badge>;
      case 'Qualifying Question':
        return <Badge variant="primary" size="sm">Discovery Hook</Badge>;
      case 'Objection Handler':
        return <Badge variant="warning" size="sm">Objection Matrix</Badge>;
    }
  };

  return (
    <Card className="border-indigo-500/20 bg-slate-900/80">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Outbound Playbook Generator
            </span>
          </div>
          <CardTitle className="text-lg mt-0.5">High-Converting Discovery Hooks & Questions</CardTitle>
        </div>

        <Badge variant="glow" size="sm">
          95% Confidence AI Playbook
        </Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {questions.map((q) => (
          <div
            key={q.id}
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 transition group"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                {getCategoryBadge(q.category)}
                <span className="text-xs text-slate-400 font-mono">
                  Score: {q.confidenceScore}%
                </span>
              </div>

              <button
                onClick={() => handleCopy(q.id, q.question)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-400 px-2 py-1 rounded bg-slate-900 border border-slate-800 transition"
              >
                {copiedId === q.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Hook</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm font-semibold text-white leading-relaxed group-hover:text-indigo-200 transition">
              "{q.question}"
            </p>

            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center gap-2 text-xs text-slate-400">
              <Target className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{q.context}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
