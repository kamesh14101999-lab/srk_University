import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentsApi } from '../../api/students';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import FilterBar from '../../components/FilterBar';
import Badge from '../../components/Badge';

export default function TeacherStudents() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    setLoading(true);
    studentsApi
      .list({ page, limit: 20, ...filters })
      .then((d) => {
        setItems(d.items || []);
        setPages(d.pages || 1);
        setTotal(d.total || 0);
      })
      .finally(() => setLoading(false));
  }, [page, JSON.stringify(filters)]);

  const columns = [
    { key: 'studentId', header: 'Student ID' },
    { key: 'name', header: 'Name', render: (r) => r.user?.name },
    { key: 'section', header: 'Section' },
    { key: 'semester', header: 'Semester' },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={r.academicStatus === 'active' ? 'green' : 'default'}>{r.academicStatus}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">My Students</h1>
      <FilterBar
        fields={[{ key: 'search', type: 'text', placeholder: 'Search name, student ID, roll no.' }]}
        values={filters}
        onChange={(v) => {
          setPage(1);
          setFilters(v);
        }}
      />
      <Table
        columns={columns}
        rows={items}
        loading={loading}
        onRowClick={(row) => navigate(`/teacher/students/${row._id}`)}
        emptyMessage="No students in your classes yet"
      />
      <Pagination page={page} pages={pages} total={total} onChange={setPage} />
    </div>
  );
}
