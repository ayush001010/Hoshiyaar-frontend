import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchLessonItemsByModule } from '../../services/lessons';

function ConceptView({ item }) {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-3">{item.title}</h2>
      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{item.content}</p>
    </div>
  );
}

function MultipleChoiceView({ item, onAnswer }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">{item.question}</h2>
      <div className="space-y-3">
        {item.options?.map((opt, idx) => (
          <label key={idx} className={`flex items-center gap-3 p-3 rounded border ${selectedIndex === idx ? 'border-blue-500' : 'border-gray-200'}`}>
            <input
              type="radio"
              name="mcq"
              checked={selectedIndex === idx}
              onChange={() => setSelectedIndex(idx)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={selectedIndex === null}
        onClick={() => onAnswer(item.options[selectedIndex])}
      >
        Submit
      </button>
    </div>
  );
}

function FillInBlankView({ item, onAnswer }) {
  const [text, setText] = useState('');
  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-3">{item.question}</h2>
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Type your answer"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={!text}
        onClick={() => onAnswer(text)}
      >
        Submit
      </button>
    </div>
  );
}

function RearrangeView({ item, onAnswer }) {
  const [order, setOrder] = useState(item.words || []);

  function move(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= order.length) return;
    const copy = order.slice();
    const [moved] = copy.splice(index, 1);
    copy.splice(newIndex, 0, moved);
    setOrder(copy);
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-3">Rearrange to form the correct sentence</h2>
      <ul className="space-y-2">
        {order.map((w, idx) => (
          <li key={idx} className="flex items-center justify-between border rounded px-3 py-2">
            <span>{w}</span>
            <div className="flex gap-2">
              <button className="px-2 py-1 border rounded" onClick={() => move(idx, -1)}>↑</button>
              <button className="px-2 py-1 border rounded" onClick={() => move(idx, 1)}>↓</button>
            </div>
          </li>
        ))}
      </ul>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => onAnswer(order.join(' '))}
      >
        Submit Order
      </button>
    </div>
  );
}

export default function LessonPlayer() {
  const { moduleNumber } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const current = useMemo(() => items[index] || null, [items, index]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchLessonItemsByModule(moduleNumber)
      .then((data) => {
        if (!isMounted) return;
        setItems(data);
        setIndex(0);
      })
      .catch((e) => setError(e.message))
      .finally(() => isMounted && setLoading(false));
    return () => { isMounted = false; };
  }, [moduleNumber]);

  function goNext() {
    if (index + 1 < items.length) setIndex((i) => i + 1);
    else navigate('/learn');
  }

  function checkAnswerAndProceed(given) {
    // Simple client-side check when answer is provided in item.answer
    const expected = current?.answer;
    if (typeof expected === 'string' && expected.length > 0) {
      const isCorrect = expected.trim().toLowerCase() === String(given).trim().toLowerCase();
      // For now we just proceed; could store progress here
      // Optionally display feedback
    }
    goNext();
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!current) return <div className="p-6">No content.</div>;

  let body = null;
  switch (current.type) {
    case 'concept':
      body = <ConceptView item={current} />;
      break;
    case 'multiple-choice':
      body = <MultipleChoiceView item={current} onAnswer={checkAnswerAndProceed} />;
      break;
    case 'fill-in-the-blank':
      body = <FillInBlankView item={current} onAnswer={checkAnswerAndProceed} />;
      break;
    case 'rearrange':
      body = <RearrangeView item={current} onAnswer={checkAnswerAndProceed} />;
      break;
    default:
      body = <div className="p-6">Unsupported type: {current.type}</div>;
  }

  return (
    <div>
      <div className="border-b p-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">Module {moduleNumber}</div>
          <div className="text-lg font-semibold">Item {index + 1} of {items.length}</div>
        </div>
        <button
          className="px-3 py-2 border rounded"
          onClick={() => navigate('/learn')}
        >Exit</button>
      </div>
      <div className="p-4">
        {body}
        {current.type === 'concept' && (
          <div className="mt-6">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={goNext}>Continue</button>
          </div>
        )}
      </div>
    </div>
  );
}


