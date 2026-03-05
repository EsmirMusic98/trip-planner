import React, { useState } from 'react';

const WorkTripPlanner = () => {
  const ALLOWED_EMAILS = ["@tess.no"];

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

  const isEmailAllowed = (email) => {
    return ALLOWED_EMAILS.some(allowedEmail => {
      if (allowedEmail.startsWith('@')) {
        return email.toLowerCase().endsWith(allowedEmail.toLowerCase());
      } else {
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

    if (!isEmailAllowed(email)) {
      setErrorMessage(`❌ Access Denied\n\nYour email "${email}" is not authorized to access this app.`);
      return;
    }

    const updatedTeams = { ...teams };
    if (!updatedTeams[teamCode]) {
      updatedTeams[teamCode] = { members: [], trips: [] };
    }

    const newUser = { id: Date.now(), name, email };
    updatedTeams[teamCode].members.push(newUser);
    setTeams(updatedTeams);
    setCurrentTeam(teamCode);
    setCurrentUser(newUser);
    setTrips(updatedTeams[teamCode].trips || []);
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
      startDate: newTrip.startDate,
      endDate: newTrip.endDate,
      location: newTrip.location,
      notes: newTrip.notes,
    };

    const updatedTeams = { ...teams };
    const updatedTrips = [...(updatedTeams[currentTeam].trips || []), trip];
    updatedTeams[currentTeam].trips = updatedTrips;
    setTeams(updatedTeams);
    setTrips(updatedTrips);

    setNewTrip({ startDate: '', endDate: '', location: '', notes: '' });
    setShowModal(false);
  };

  const deleteTrip = (tripId) => {
    const updatedTeams = { ...teams };
    const updatedTrips = updatedTeams[currentTeam].trips.filter(t => t.id !== tripId);
    updatedTeams[currentTeam].trips = updatedTrips;
    setTeams(updatedTeams);
    setTrips(updatedTrips);
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
            <p className="text-xs text-slate-500 mt-2">🔒 Private access</p>
          </div>

          {errorMessage && (
            <div className="bg-red-900/30 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6">
              {errorMessage}
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">New Member? Join</h2>
              <form onSubmit={handleSignup} className="space-y-4">
                <input type="text" name="name" placeholder="Your Name" className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white" required />
                <input type="email" name="email" placeholder="Work Email" className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white" required />
                <input type="text" name="teamCode" placeholder="Team Code" className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white uppercase" required />
                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg">Sign Up</button>
              </form>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">Log In</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" name="email" placeholder="Email" className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white" required />
                <input type="text" name="teamCode" placeholder="Team Code" className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white uppercase" required />
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg">Log In</button>
              </form>
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
          <h1 className="text-2xl font-bold text-slate-900">📅 TripSync</h1>
          <div className="hidden md:flex items-center gap-6">
            <span className="text-sm text-slate-700">{currentUser.name}</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{currentTeam}</span>
            <button onClick={handleLogout} className="text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-lg">Logout</button>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white p-4 border-t border-slate-200">
            <button onClick={handleLogout} className="text-slate-600 px-4 py-2">Logout</button>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                  <button onClick={() => setCalendarView('month')} className={`px-4 py-2 rounded-lg ${calendarView === 'month' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>Month</button>
                  <button onClick={() => setCalendarView('week')} className={`px-4 py-2 rounded-lg ${calendarView === 'week' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>Week</button>
                </div>
              </div>
              <div className="flex justify-between">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-2">◀</button>
                <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 text-blue-600">Today</button>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-2">▶</button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-7 bg-slate-50 border-b">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-4 text-center font-semibold text-slate-600">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 min-h-96">
                {calendarDays.map((day, idx) => {
                  const dayTrips = day ? isTripOnDay(day) : [];
                  return (
                    <div key={idx} className={`p-3 border border-slate-200 min-h-24 ${day ? 'bg-white' : 'bg-slate-50'}`}>
                      {day && (
                        <>
                          <div className="font-semibold text-slate-900 mb-2">{day}</div>
                          {dayTrips.slice(0, 2).map(trip => (
                            <div key={trip.id} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mb-1">{trip.userName.split(' ')[0]}</div>
                          ))}
                          {dayTrips.length > 2 && <div className="text-xs text-slate-600">+{dayTrips.length - 2}</div>}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <button onClick={() => setShowModal(true)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">+ Add Trip</button>

            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4">Team Members</h3>
              <div className="space-y-2">
                {teams[currentTeam]?.members.map(member => (
                  <div key={member.id}>
                    <div className="font-medium text-slate-900">{member.name}</div>
                    <div className="text-xs text-slate-500">{member.email}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4">Your Trips</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {trips.filter(t => t.userId === currentUser.id).map(trip => (
                  <div key={trip.id} className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="font-medium text-slate-900">{trip.location}</div>
                    <div className="text-xs text-slate-600">{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</div>
                    <button onClick={() => deleteTrip(trip.id)} className="text-xs text-red-600 mt-2">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Schedule Trip</h2>
            <form onSubmit={addTrip} className="space-y-4">
              <input type="text" value={newTrip.location} onChange={(e) => setNewTrip({...newTrip, location: e.target.value})} placeholder="Location" className="w-full px-4 py-2 border rounded-lg" required />
              <input type="date" value={newTrip.startDate} onChange={(e) => setNewTrip({...newTrip, startDate: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
              <input type="date" value={newTrip.endDate} onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})} className="w-full px-4 py-2 border rounded-lg" required />
              <textarea value={newTrip.notes} onChange={(e) => setNewTrip({...newTrip, notes: e.target.value})} placeholder="Notes" className="w-full px-4 py-2 border rounded-lg" rows="2"></textarea>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkTripPlanner;
