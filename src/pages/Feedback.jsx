import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MessageSquare, Star, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import '../feedback.css';

const Feedback = () => {
  const navigate = useNavigate();
  const { shop } = useOutletContext();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    if (!shop) return;

    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        const { data: fbs } = await supabase.from('feedback')
          .select('*')
          .eq('shop_id', shop.id)
          .order('created_at', { ascending: false });
        if (fbs) setFeedbacks(fbs);
      } catch (err) {
        console.error('Error fetching feedbacks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [shop]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i <= rating ? '#FFC107' : 'transparent'}
          color={i <= rating ? '#FFC107' : 'var(--color-text-muted)'}
          style={{ marginRight: '2px' }}
        />
      );
    }
    return stars;
  };

  return (
    <div className="feedback-container">
      <header className="feedback-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigate(-1)} 
            className="back-btn"
            style={{ background: 'none', border: 'none', color: 'var(--color-text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="feedback-title" style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
            {t.recentFeedbacks}
          </h2>
        </div>
      </header>

      <main className="feedback-main">
        {loading ? (
          <div className="feedback-loading">{t.loading}</div>
        ) : feedbacks.length === 0 ? (
          <div className="feedback-empty">
            <MessageSquare size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '16px', opacity: 0.5 }} />
            <p>{t.noFeedback}</p>
          </div>
        ) : (
          <div className="feedback-list">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="feedback-card">
                <div className="feedback-card-header">
                  <div className="rating-container">
                    {fb.rating ? renderStars(fb.rating) : <span className="no-rating">No rating</span>}
                  </div>
                  <span className="feedback-date">
                    {new Date(fb.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="feedback-msg">"{fb.message || 'No comment provided.'}"</p>
                
                <div className="feedback-meta">
                  <span className="feedback-table">Table {fb.table_number || '?'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Feedback;
