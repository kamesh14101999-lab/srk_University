import { useEffect, useState } from 'react';
import { sportsApi } from '../../api/sports';
import { tournamentsApi } from '../../api/tournaments';
import { teamsApi } from '../../api/teams';
import { fixturesApi } from '../../api/fixtures';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';
import CrudManager from '../../components/CrudManager';
import Badge from '../../components/Badge';

const TABS = ['Sports', 'Tournaments', 'Teams', 'Fixtures'];

export default function SportsPage() {
  const { user } = useAuth();
  const readOnly = user?.role !== 'admin';
  const [tab, setTab] = useState('Sports');
  const [sportOptions, setSportOptions] = useState([]);
  const [tournamentOptions, setTournamentOptions] = useState([]);
  const [teamOptions, setTeamOptions] = useState([]);

  useEffect(() => {
    sportsApi.list({ limit: 100 }).then((d) => setSportOptions(d.items.map((s) => ({ value: s._id, label: s.name }))));
    tournamentsApi.list({ limit: 100 }).then((d) => setTournamentOptions(d.items.map((t) => ({ value: t._id, label: t.name }))));
    teamsApi.list({ limit: 100 }).then((d) => setTeamOptions(d.items.map((t) => ({ value: t._id, label: t.name }))));
  }, [tab]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-md bg-gray-100 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${tab === t ? 'bg-white text-primary-700 shadow' : 'text-gray-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Sports' && (
        <CrudManager
          title="Sport"
          api={sportsApi}
          readOnly={readOnly}
          columns={[
            { key: 'name', header: 'Name', sortable: true },
            { key: 'description', header: 'Description' },
          ]}
          formFields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
          ]}
          filterFields={[{ key: 'search', type: 'text', placeholder: 'Search name' }]}
        />
      )}

      {tab === 'Tournaments' && (
        <CrudManager
          title="Tournament"
          api={tournamentsApi}
          readOnly={readOnly}
          columns={[
            { key: 'name', header: 'Name', sortable: true },
            { key: 'sport', header: 'Sport', render: (r) => r.sport?.name },
            { key: 'status', header: 'Status', render: (r) => <Badge variant="primary">{r.status}</Badge> },
            { key: 'startDate', header: 'Start', sortable: true, render: (r) => formatDate(r.startDate) },
            { key: 'endDate', header: 'End', sortable: true, render: (r) => formatDate(r.endDate) },
          ]}
          formFields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'sport', label: 'Sport', type: 'select', required: true, options: sportOptions },
            { name: 'startDate', label: 'Start Date', type: 'date' },
            { name: 'endDate', label: 'End Date', type: 'date' },
            { name: 'venue', label: 'Venue' },
            { name: 'status', label: 'Status', type: 'select', options: ['upcoming', 'ongoing', 'completed'].map((s) => ({ value: s, label: s })) },
          ]}
          filterFields={[
            { key: 'search', type: 'text', placeholder: 'Search name or venue' },
            { key: 'sport', type: 'select', placeholder: 'All Sports', options: sportOptions },
            { key: 'status', type: 'select', placeholder: 'All Statuses', options: ['upcoming', 'ongoing', 'completed'].map((s) => ({ value: s, label: s })) },
          ]}
        />
      )}

      {tab === 'Teams' && (
        <CrudManager
          title="Team"
          api={teamsApi}
          readOnly={readOnly}
          columns={[
            { key: 'name', header: 'Name', sortable: true },
            { key: 'sport', header: 'Sport', render: (r) => r.sport?.name },
            { key: 'tournament', header: 'Tournament', render: (r) => r.tournament?.name },
            { key: 'captain', header: 'Captain', render: (r) => r.captain?.user?.name || '-' },
          ]}
          formFields={[
            { name: 'name', label: 'Name', required: true },
            { name: 'sport', label: 'Sport', type: 'select', required: true, options: sportOptions },
            { name: 'tournament', label: 'Tournament', type: 'select', required: true, options: tournamentOptions },
          ]}
          filterFields={[
            { key: 'search', type: 'text', placeholder: 'Search name' },
            { key: 'sport', type: 'select', placeholder: 'All Sports', options: sportOptions },
            { key: 'tournament', type: 'select', placeholder: 'All Tournaments', options: tournamentOptions },
          ]}
        />
      )}

      {tab === 'Fixtures' && (
        <CrudManager
          title="Fixture"
          api={fixturesApi}
          readOnly={readOnly}
          columns={[
            { key: 'tournament', header: 'Tournament', render: (r) => r.tournament?.name },
            { key: 'teamA', header: 'Team A', render: (r) => r.teamA?.name },
            { key: 'teamB', header: 'Team B', render: (r) => r.teamB?.name },
            { key: 'date', header: 'Date', sortable: true, render: (r) => formatDate(r.date) },
            { key: 'score', header: 'Score', render: (r) => `${r.scoreA ?? 0} - ${r.scoreB ?? 0}` },
            { key: 'status', header: 'Status', render: (r) => <Badge>{r.status}</Badge> },
          ]}
          formFields={[
            { name: 'tournament', label: 'Tournament', type: 'select', required: true, options: tournamentOptions },
            { name: 'teamA', label: 'Team A', type: 'select', required: true, options: teamOptions },
            { name: 'teamB', label: 'Team B', type: 'select', required: true, options: teamOptions },
            { name: 'date', label: 'Date', type: 'date' },
            { name: 'venue', label: 'Venue' },
            { name: 'scoreA', label: 'Score A', type: 'number' },
            { name: 'scoreB', label: 'Score B', type: 'number' },
            { name: 'status', label: 'Status', type: 'select', options: ['scheduled', 'ongoing', 'completed', 'cancelled'].map((s) => ({ value: s, label: s })) },
          ]}
          filterFields={[
            { key: 'tournament', type: 'select', placeholder: 'All Tournaments', options: tournamentOptions },
            { key: 'status', type: 'select', placeholder: 'All Statuses', options: ['scheduled', 'ongoing', 'completed', 'cancelled'].map((s) => ({ value: s, label: s })) },
          ]}
        />
      )}
    </div>
  );
}
