'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { Loader, Mail, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import ProfileCompletionGuard from '@/components/auth/ProfileCompletionGuard';
import EmailVerificationGuard from '@/components/auth/EmailVerificationGuard';

export default function InvitationsPage() {
  const { firebaseUser } = useAuth();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    if (firebaseUser) fetchInvitations();
  }, [firebaseUser]);

  const fetchInvitations = async () => {
    try {
      setError(null);
      const token = await firebaseUser?.getIdToken();
      const res = await fetch('/api/influencers/invitations', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setInvitations(data.data.invitations);
      } else {
        setError(data.error || 'Failed to load invitations');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load invitations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id: string, status: 'accepted' | 'declined') => {
    if (respondingId) return;
    setRespondingId(id);
    try {
      const token = await firebaseUser?.getIdToken();
      const res = await fetch(`/api/influencers/invitations/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to respond to invitation');
        return;
      }
      fetchInvitations();
    } catch (err) {
      console.error(err);
      setError('Failed to respond. Please try again.');
    } finally {
      setRespondingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <ProfileCompletionGuard>
      <EmailVerificationGuard>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6">Campaign Invitations</h1>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span className="text-sm">{error}</span>
                <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700 text-sm font-medium">
                  Dismiss
                </button>
              </div>
            )}

            {invitations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No invitations yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invitations.map((inv) => (
                  <div key={inv.id} className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="font-semibold text-lg mb-2">{inv.campaign?.title || 'Campaign'}</h3>
                    <p className="text-gray-600 text-sm mb-4">{inv.campaign?.description}</p>
                    {inv.message && <p className="text-sm italic text-gray-500 mb-4">&quot;{inv.message}&quot;</p>}

                    {inv.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespond(inv.id, 'accepted')}
                          disabled={respondingId !== null}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {respondingId === inv.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespond(inv.id, 'declined')}
                          disabled={respondingId !== null}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {respondingId === inv.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          Decline
                        </button>
                      </div>
                    ) : (
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        inv.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        inv.status === 'declined' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </EmailVerificationGuard>
    </ProfileCompletionGuard>
  );
}
