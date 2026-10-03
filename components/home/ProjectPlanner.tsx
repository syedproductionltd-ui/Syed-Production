'use client';

import { useRef, useState } from 'react';
import { destinations, settings } from '@/lib/data';
import responses from '@/lib/__responses.json';
import SectionHeader from '@/components/SectionHeader';

const { aiResponses, chatResponses } = responses;

const INTERESTS = [
  { key: 'wedding', label: 'Wedding' },
  { key: 'corporate', label: 'Corporate' },
  { key: 'music', label: 'Music Video' },
  { key: 'event', label: 'Event' },
  { key: 'documentary', label: 'Documentary' },
  { key: 'photography', label: 'Photography' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'branding', label: 'Branding' },
];

const DURATION_MAP: Record<string, string> = {
  weekend: '3 Days',
  week: '7 Days',
  twoweeks: '14 Days',
  month: '30 Days',
};

const BUDGET_MAP: Record<string, string> = {
  budget: 'Budget',
  mid: 'Mid-Range',
  luxury: 'Premium',
};

const STYLE_LABEL: Record<string, string> = {
  solo: 'Solo',
  couple: 'Couple',
  family: 'Family',
  group: 'Group',
};

const DAY_ACTIVITIES = [
  'Pre-production planning and storyboarding for',
  'Location scouting and setup for',
  'Principal shooting day for',
  'B-roll and detail shots for',
  'Interview and testimonial recording for',
  'Aerial/drone footage capture for',
  'Post-production and review for',
];

interface Message {
  id: number;
  from: 'user' | 'ai';
  /** Rendered as limited HTML: <p>, <strong> and <div class="itinerary-*">. */
  html: string;
}

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Escapes, then re-allows the two inline tags the reply templates use. */
function formatChatText(text: string) {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function buildPlan(budget: string, duration: string, style: string, interests: string[]) {
  const list = interests.length > 0 ? interests : ['wedding'];
  const pool = (aiResponses as Record<string, string[]>)[list[0]!] ?? aiResponses.default!;
  const intro = pool[Math.floor(Math.random() * pool.length)]!;

  const relevant = destinations
    .filter(
      (d) =>
        list.includes(d.category) ||
        list.some((i) => d.highlights.some((h) => h.toLowerCase().includes(i)))
    )
    .slice(0, 4);

  if (relevant.length === 0 && destinations.length >= 3) {
    relevant.push(destinations[0]!, destinations[2]!);
  }

  const days =
    duration === 'weekend' ? 3 : duration === 'week' ? 7 : duration === 'twoweeks' ? 14 : 30;

  const dayRows = [];
  for (let i = 1; i <= Math.min(days, 7); i++) {
    if (relevant.length === 0) break;
    const dest = relevant[(i - 1) % relevant.length]!;
    const activity = DAY_ACTIVITIES[(i - 1) % DAY_ACTIVITIES.length]!;
    const highlight = dest.highlights[i % dest.highlights.length];
    dayRows.push(
      `<div class="itinerary-day"><strong>Day ${i}:</strong> ${activity} ${dest.name} — ${highlight}</div>`
    );
  }

  const tail =
    days > 7
      ? `<div class="itinerary-day"><strong>Days 8–${days}:</strong> Extended post-production — color grading, VFX, sound design, and final delivery!</div>`
      : '';

  return `
    <p>${formatChatText(intro)}</p>
    <div class="itinerary-card">
      <h4>Your ${DURATION_MAP[duration] ?? duration} ${STYLE_LABEL[style] ?? style} Production Plan</h4>
      <p style="font-size:12px; color:#64748b; margin-bottom:8px;">Scale: ${BUDGET_MAP[budget] ?? budget} | Interests: ${list.join(', ')}</p>
      ${dayRows.join('')}
      ${tail}
    </div>
    <p style="margin-top:12px; font-size:13px;">Would you like me to adjust anything or start booking? Contact us on WhatsApp for instant confirmation!</p>
  `;
}

function keywordReply(text: string): string {
  const lower = text.toLowerCase();
  for (const [key, value] of Object.entries(chatResponses)) {
    if (key === 'default') continue;
    const pattern = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(lower)) return value;
  }
  return chatResponses.default!;
}

export default function ProjectPlanner() {
  const [budget, setBudget] = useState('mid');
  const [duration, setDuration] = useState('week');
  const [style, setStyle] = useState('couple');
  const [interests, setInterests] = useState<string[]>(['wedding']);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: 'ai', html: `<p>${settings.aiProjectPlanner.welcomeMessage}</p>` },
  ]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const nextId = useRef(1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function push(from: 'user' | 'ai', html: string) {
    const id = nextId.current++;
    setMessages((prev) => [...prev, { id, from, html }]);
  }

  function toggleInterest(key: string) {
    setInterests((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function generatePlan() {
    const labels =
      interests
        .map((i) => INTERESTS.find((x) => x.key === i)?.label ?? i)
        .join(', ') || 'Wedding';
    push('user', `<p>Plan a project with interests: ${escapeHtml(labels)}</p>`);

    setTyping(true);
    const timer = setTimeout(() => {
      setTyping(false);
      push('ai', buildPlan(budget, duration, style, interests));
    }, 1800);
    timers.current.push(timer);
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    push('user', `<p>${escapeHtml(trimmed)}</p>`);
    setDraft('');
    // Static site: no AI server, so answer from the built-in keyword table.
    push('ai', `<p>${formatChatText(keywordReply(trimmed))}</p>`);
  }

  return (
    <section className="project-planner section" id="project-planner">
      <div className="container">
        <SectionHeader section="projectPlanner" />
        <div className="planner-layout reveal-up">
          <div className="planner-inputs">
            <h3>Your Preferences</h3>
            <div className="planner-field">
              <label htmlFor="plannerBudget">Project Scale</label>
              <select
                id="plannerBudget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              >
                <option value="budget">Budget</option>
                <option value="mid">Mid-Range</option>
                <option value="luxury">Premium</option>
              </select>
            </div>
            <div className="planner-field">
              <label htmlFor="plannerDuration">Project Timeline</label>
              <select
                id="plannerDuration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="weekend">Quick (1–2 days)</option>
                <option value="week">Standard (3–7 days)</option>
                <option value="twoweeks">Extended (1–2 weeks)</option>
                <option value="month">Full Production (1 month+)</option>
              </select>
            </div>
            <div className="planner-field">
              <label>Project Type</label>
              <div className="planner-tags" role="group" aria-label="Select project types">
                {INTERESTS.map((i) => (
                  <button
                    key={i.key}
                    className={`planner-tag${interests.includes(i.key) ? ' active' : ''}`}
                    aria-pressed={interests.includes(i.key)}
                    onClick={() => toggleInterest(i.key)}
                  >
                    {i.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="planner-field">
              <label htmlFor="plannerStyle">Client Type</label>
              <select id="plannerStyle" value={style} onChange={(e) => setStyle(e.target.value)}>
                <option value="solo">Individual</option>
                <option value="couple">Couple / Wedding</option>
                <option value="family">Small Business</option>
                <option value="group">Corporate / Agency</option>
              </select>
            </div>
            <button className="btn btn-primary planner-generate" onClick={generatePlan}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 15l-4-4 1.41-1.41L11 14.17l5.59-5.59L18 10l-7 7z"
                  fill="currentColor"
                />
              </svg>
              Plan My Project
            </button>
          </div>

          <div className="planner-chat">
            <div
              className="chat-messages"
              id="chatMessages"
              aria-live="polite"
              aria-label="AI project planner conversation"
            >
              {messages.map((m) => (
                <div key={m.id} className={`chat-message ${m.from}`}>
                  {m.from === 'ai' && <div className="chat-avatar">AI</div>}
                  <div
                    className="chat-bubble"
                    dangerouslySetInnerHTML={{ __html: m.html }}
                  />
                </div>
              ))}
              {typing && (
                <div className="chat-message ai" id="typingIndicator">
                  <div className="chat-avatar">AI</div>
                  <div className="chat-bubble">
                    <span className="typing-dots" aria-label="Assistant is typing">
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="chat-input-area">
              <input
                type="text"
                value={draft}
                placeholder="Ask about our services..."
                aria-label="Chat message input"
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') send(draft);
                }}
              />
              <button
                className="chat-send-btn"
                aria-label="Send message"
                onClick={() => send(draft)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
