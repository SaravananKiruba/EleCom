'use client';

import { Box, Text, Flex, Badge, HStack, Button } from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { downloadCSV } from '@/utils/csvExport';

interface AuditLog {
  id: string; entityType: string; entityId: string; action: string;
  createdAt: string; oldValues?: object; newValues?: object;
  user?: { name: string; email: string } | null;
}

const PAGE_SIZE = 30;
const ACTION_COLORS: Record<string, string> = {
  CREATE: 'green', UPDATE: 'blue', DELETE: 'red', STATUS_CHANGE: 'orange', LOGIN: 'purple', LOGOUT: 'gray',
};

export default function AuditLogPage() {
  const { user } = useAuth();
  const tenantId = user.tenantId;

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    const q = new URLSearchParams({ tenantId, skip: String((page - 1) * PAGE_SIZE), take: String(PAGE_SIZE) });
    if (entityFilter) q.set('entityType', entityFilter);
    const data = await fetch(`/api/audit-logs?${q}`).then(r => r.json()).finally(() => setLoading(false));
    setLogs(data.logs ?? []);
    setTotal(data.total ?? 0);
  }, [tenantId, page, entityFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const exportAll = async () => {
    if (!tenantId) return;
    const data = await fetch(`/api/audit-logs?tenantId=${tenantId}&take=5000`).then(r => r.json());
    downloadCSV((data.logs ?? []).map((l: AuditLog) => ({
      Time: new Date(l.createdAt).toLocaleString('en-IN'),
      User: l.user?.name ?? '—',
      Entity: l.entityType,
      ID: l.entityId,
      Action: l.action,
    })), 'audit-log.csv');
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Box p={{ base: 4, md: 6 }}>
      <PageHeader
        title="Audit Log"
        subtitle={`${total} total entries`}
        actions={
          <Button size="sm" variant="outline" colorPalette="green" onClick={exportAll}>↓ Export CSV</Button>
        }
      />

      <Flex gap={3} mb={5} flexWrap="wrap">
        {['', 'Product', 'Customer', 'RFQ', 'Quote', 'SalesOrder', 'User'].map(et => (
          <Button
            key={et} size="sm" variant={entityFilter === et ? 'solid' : 'outline'}
            colorPalette={entityFilter === et ? 'blue' : 'gray'}
            onClick={() => { setEntityFilter(et); setPage(1); }}
          >
            {et || 'All'}
          </Button>
        ))}
      </Flex>

      {loading ? (
        <Box py={10} textAlign="center"><Text color="gray.400">Loading...</Text></Box>
      ) : logs.length === 0 ? (
        <EmptyState icon="🔍" title="No audit logs found" />
      ) : (
        <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: '680px' }}>
              <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <Box as="tr">
                  {['Time', 'User', 'Entity', 'Action', 'ID'].map(h => (
                    <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wide">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {logs.map(log => (
                  <Box as="tr" key={log.id} borderTop="1px solid" borderColor="gray.50" _hover={{ bg: 'gray.50' }}>
                    <Box as="td" px={4} py={3}>
                      <Text fontSize="xs" color="gray.600">
                        {new Date(log.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </Box>
                    <Box as="td" px={4} py={3}>
                      <Text fontSize="sm" fontWeight={600} color="gray.800">{log.user?.name ?? '—'}</Text>
                      <Text fontSize="xs" color="gray.400">{log.user?.email ?? ''}</Text>
                    </Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" color="gray.700">{log.entityType}</Text></Box>
                    <Box as="td" px={4} py={3}>
                      <Badge colorPalette={ACTION_COLORS[log.action] ?? 'gray'} variant="subtle" size="sm">{log.action}</Badge>
                    </Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" fontFamily="mono" color="gray.400">{log.entityId.slice(0, 12)}…</Text></Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </Box>
  );
}
