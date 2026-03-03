import React, { useState } from 'react';
import React, { useState } from 'react';

const WorkTripPlanner = () => {
  // ===== EMAIL WHITELIST CONFIGURATION =====
  // Add your company email domains here
  // Example: ["@yourcompany.com", "@company.co.uk", "john@example.com"]
  const ALLOWED_EMAILS = [
    "@yourcompany.com",     // Anyone with this domain can access
    "@company.com",         // Add more domains as needed
    "specific.person@gmail.com"  // Or add specific individual emails
  ];
  // ========================================

  const [view, setView] = useState('auth');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month');
  const [teams, setTeams] = useState({});
  const [currentTeam, setCurrentTeam] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTrip, setNewTrip] = useState({ startDate: '', endDate: '', location: '', notes: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check if email is in the whitelist
  const isEmailAllowed = (email) => {
    return ALLOWED_EMAILS.some(allowedEmail => {
      if (allowedEmail.startsWith('@')) {
        // Domain check: @company.com
        return email.toLowerCase().endsWith(allowedEmail.toLowerCase());
      } else {
        // Specific email check: user@example.com
        return email.toLowerCase() === allowedEmail.toLowerCase();
      }
    });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    const formData = new FormData(e.target);
    const teamCode = formData.get('teamCode').trim().toUpperCase();
    const email = formData.get('email').trim();
    const name = formData.get('name').trim();

    // ===== EMAIL WHITELIST CHECK =====
    if (!isEmailAllowed(email)) {
      setErrorMessage(`❌ Access Denied\n\nYour email "${email}" is not authorized to access this app.\n\nIf you believe this is an error, contact your administrator.`);
      return;
    }
    // ==================================

    if (!teams[teamCode]) {
      teams[teamCode] = { members: [], trips: [] };
    }

    const newUser = { id: Date.now(), name, email };
    teams[teamCode].members.push(newUser);
    setTeams({ ...teams });
    setCurrentTeam(teamCode);
    setCurrentUser(newUser);
    setTrips(teams[teamCode].trips || []);
    setView('dashboard');
    e.target.reset();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    const formData = new FormData(e.target);
    const teamCode = formData.get('teamCode').trim().toUpperCase();
    const email = formData.get('email').trim();

    if (teams[teamCode]) {
      const user = teams[teamCode].members.find(m => m.email === email);
      if (user) {
        setCurrentTeam(teamCode);
        setCurrentUser(user);
        setTrips(teams[teamCode].trips || []);
        setView('dashboard');
        e.target.reset();
        return;
      }
    }
    setErrorMessage('Team or email not found. Please check and try again.');
  };

  const handleLogout = () => {
    setView('auth');
    setCurrentUser(null);
    setCurrentTeam(null);
    setTrips([]);
    setMobileMenuOpen(false);
    setErrorMessage('');
  };

  const addTrip = (e) => {
    e.preventDefault();
    if (!newTrip.startDate || !newTrip.endDate) return;

    const trip = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      startDate: new Date(newTrip.startDate),
      endDate: new Date(newTrip.endDate),
      location: newTrip.location,
      notes: newTrip.notes,
    };

    const updatedTrips = [...trips, trip];
    setTrips(updatedTrips);
    if (teams[currentTeam]) {
      teams[currentTeam].trips = updatedTrips;
      setTeams({ ...teams });
    }

    setNewTrip({ startDate: '', endDate: '', location: '', notes: '' });
    setShowModal(false);
  };

  const deleteTrip = (tripId) => {
    const updatedTrips = trips.filter(t => t.id !== tripId);
    setTrips(updatedTrips);
    if (teams[currentTeam]) {
      teams[currentTeam].trips = updatedTrips;
      setTeams({ ...teams });
    }
  };

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const isTripOnDay = (day) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return trips.filter(trip => {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      return checkDate >= start && checkDate <= end;
    });
  };

  const monthDays = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const calendarDays = Array(firstDay).fill(null).concat(Array.from({ length: monthDays }, (_, i) => i + 1));

  if (view === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
          * { font-family: 'Inter', sans-serif; } h1, h2, h3 { font-family: 'Outfit', sans-serif; }`}</style>
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">📅 TripSync</h1>
            <p className="text-slate-400">Team work trip coordination</p>
            <p className="text-xs text-slate-500 mt-2">🔒 Private access for authorized team members only</p>
          </div>

          {errorMessage && (
            <div className="bg-red-900/30 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6 whitespace-pre-wrap">
              {errorMessage}
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">New Member? Join</h2>
              <form onSubmit={handleSignup} className="space-y-4">
                <input type="text" name="name" placeholder="Your Name" className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400" required />
                <input type="email" name="email" placeholder="Work Email" className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400" required />
                <input type="text" name="teamCode" placeholder="Team Code (e.g., SALES2024)" className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 uppercase" required />
                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition">Sign Up</button>
              </form>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">Returning? Log In</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" name="email" placeholder="Your Email" className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400" required />
                <input type="text" name="teamCode" placeholder="Team Code" className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 uppercase" required />
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg transition">Log In</button>
              </form>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <p className="text-xs text-slate-300">
                <strong>🔒 Security:</strong> Only authorized email addresses can access this app.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <h1 className="text-2xl font-bold text-slate-900">TripSync</h1>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="text-sm font-medium">{currentUser.name}</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{currentTeam}</span>
            </div>
            <button onClick={handleLogout} className="text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-lg">Logout</button>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-slate-100 rounded-lg">
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3">
            <div className="text-sm font-medium text-slate-700">{currentUser.name}</div>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full inline-block">{currentTeam}</span>
            <button onClick={handleLogout} className="w-full text-left text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-lg">Logout</button>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCalendarView('month')} className={`px-4 py-2 rounded-lg font-medium ${calendarView === 'month' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>Month</button>
                  <button onClick={() => setCalendarView('week')} className={`px-4 py-2 rounded-lg font-medium ${calendarView === 'week' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>Week</button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-2 hover:bg-slate-100 rounded-lg">◀</button>
                <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg">Today</button>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-2 hover:bg-slate-100 rounded-lg">▶</button>
              </div>
            </div>

            {calendarView === 'month' ? (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-4 text-center text-sm font-semibold text-slate-600">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 min-h-96">
                  {calendarDays.map((day, idx) => {
                    const dayTrips = day ? isTripOnDay(day) : [];
                    return (
                      <div key={idx} className={`p-3 border border-slate-200 text-sm min-h-24 ${day ? 'bg-white hover:bg-slate-50' : 'bg-slate-50'}`}>
                        {day && <>
                          <div className="font-semibold text-slate-900 mb-2">{day}</div>
                          <div className="space-y-1">
                            {dayTrips.slice(0, 2).map(trip => (
                              <div key={trip.id} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded truncate">{trip.userName.split(' ')[0]}</div>
                            ))}
                            {dayTrips.length > 2 && <div className="text-xs text-slate-600 px-2">+{dayTrips.length - 2}</div>}
                          </div>
                        </>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                  {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                    const date = new Date(currentDate);
                    const dayOfWeek = currentDate.getDay();
                    date.setDate(currentDate.getDate() - dayOfWeek + offset);
                    return (
                      <div key={offset} className="p-4 text-center border-r border-slate-200 last:border-r-0">
                        <div className="text-xs font-semibold text-slate-600">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className="text-lg font-bold text-slate-900 mt-1">{date.getDate()}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-7 min-h-96">
                  {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                    const date = new Date(currentDate);
                    const dayOfWeek = currentDate.getDay();
                    date.setDate(currentDate.getDate() - dayOfWeek + offset);
                    const dayTrips = trips.filter(trip => {
                      const start = new Date(trip.startDate);
                      const end = new Date(trip.endDate);
                      return date >= start && date <= end;
                    });
                    return (
                      <div key={offset} className="p-3 border border-slate-200 bg-white hover:bg-slate-50 border-r last:border-r-0">
                        <div className="space-y-2">
                          {dayTrips.map(trip => (
                            <div key={trip.id} className="text-xs bg-blue-100 text-blue-700 p-2 rounded border border-blue-200">
                              <div className="font-semibold">{trip.userName}</div>
                              <div className="text-blue-600">{trip.location}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <button onClick={() => setShowModal(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg">+ Add Trip</button>

            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">👥 Team Members</h3>
              <div className="space-y-3">
                {teams[currentTeam]?.members.map(member => {
                  const memberTrips = trips.filter(t => t.userId === member.id);
                  return (
                    <div key={member.id} className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{member.name}</div>
                        <div className="text-xs text-slate-500">{member.email}</div>
                        <div className="text-xs text-slate-400 mt-1">{memberTrips.length} trips</div>
                      </div>
                      {member.id === currentUser.id && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">You</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Trips</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {trips.filter(t => t.userId === currentUser.id).sort((a, b) => new Date(a.startDate) - new Date(b.startDate)).map(trip => (
                  <div key={trip.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{trip.location}</div>
                        <div className="text-xs text-slate-600 mt-1">{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</div>
                        {trip.notes && <div className="text-xs text-slate-500 mt-2 italic">{trip.notes}</div>}
                      </div>
                      <button onClick={() => deleteTrip(trip.id)} className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded opacity-0 group-hover:opacity-100">Delete</button>
                    </div>
                  </div>
                ))}
                {trips.filter(t => t.userId === currentUser.id).length === 0 && <p className="text-sm text-slate-500 text-center py-4">No trips yet</p>}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Schedule a Work Trip</h2>
            </div>
            <form onSubmit={addTrip} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <input type="text" value={newTrip.location} onChange={(e) => setNewTrip({ ...newTrip, location: e.target.value })} placeholder="e.g., New York" className="w-full px-4 py-2 rounded-lg border border-slate-300" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                <input type="date" value={newTrip.startDate} onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                <input type="date" value={newTrip.endDate} onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes (optional)</label>
                <textarea value={newTrip.notes} onChange={(e) => setNewTrip({ ...newTrip, notes: e.target.value })} placeholder="Purpose or details" className="w-full px-4 py-2 rounded-lg border border-slate-300 resize-none" rows="3" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">Add Trip</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkTripPlanner;
