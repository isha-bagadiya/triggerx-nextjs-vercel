import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../leaderboard/Table";
import type { JobLog } from "@/hooks/useJobLogs";
import { Typography } from "../ui/Typography";
import { Card } from "../ui/Card";
import { ExternalLink, ChevronDownIcon } from "lucide-react";

interface JobLogsTableProps {
  logs: JobLog[];
  error?: string;
}

const JobLogsMobileView: React.FC<JobLogsTableProps> = ({ logs, error }) => {
  // Show all logs if 11 or more, otherwise limit to 10
  const shouldShowAll = logs.length >= 11;
  const displayLogs = shouldShowAll ? logs : logs.slice(0, 10);
  const shouldScroll = logs.length > 10;

  return (
    <div className="md:hidden w-full">
      {error ? (
        <Card className="mb-4">
          <Typography className="text-center text-red-400">{error}</Typography>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="mb-4">
          <Typography className="text-center text-red-400">
            No logs found.
          </Typography>
        </Card>
      ) : (
        <div
          className={`grid grid-cols-1 gap-4 ${shouldScroll ? " max-h-[600px] overflow-y-auto" : ""}`}
          style={shouldScroll ? { maxHeight: 600 } : {}}
        >
          {displayLogs.map((log) => {
            const hasValidTimestamp =
              !!log.execution_timestamp &&
              log.execution_timestamp !== "0001-01-01T00:00:00Z";

            const hasStatusText = !!(
              log.task_status && log.task_status.trim() !== ""
            );

            return (
              <Card key={`${log.task_id}-${log.task_number}`} className="mb-2">
                <div className="flex flex-col gap-2 ">
                  <div className="flex justify-between  py-1">
                    <Typography variant="body" color="primary">
                      Task Number
                    </Typography>
                    <Typography color="gray">{log.task_number}</Typography>
                  </div>
                  <div className="flex justify-between  py-1">
                    <Typography color="primary" variant="body">
                      Timestamp
                    </Typography>
                    <Typography color="gray">
                      {hasValidTimestamp
                        ? new Date(log.execution_timestamp).toLocaleString()
                        : "-"}
                    </Typography>
                  </div>
                  <div className="flex justify-between  py-1">
                    <Typography color="primary" variant="body">
                      Status
                    </Typography>
                    <Typography color="gray">
                      {log.is_successful ? (
                        <span className="text-green-400">Success</span>
                      ) : (
                        <span className="text-red-400">Failed</span>
                      )}
                      {hasStatusText && (
                        <span className="ml-2 text-gray-400">
                          ({log.task_status})
                        </span>
                      )}
                    </Typography>
                  </div>
                  <div className="flex justify-between   py-1">
                    <Typography color="primary" variant="body">
                      Operation Cost
                    </Typography>
                    <Typography color="gray">{log.task_opx_cost}</Typography>
                  </div>
                  <div className="flex justify-between  py-1">
                    <Typography color="primary" variant="body">
                      Tx Hash
                    </Typography>
                    <Typography color="gray">
                      {log.tx_url && log.execution_tx_hash ? (
                        <a
                          href={log.tx_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:text-[#F8ff7c]/80 "
                        >
                          {log.execution_tx_hash.slice(0, 8)}...
                          {log.execution_tx_hash.slice(-6)}
                        </a>
                      ) : (
                        <span>-</span>
                      )}
                    </Typography>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const JobLogsTable: React.FC<JobLogsTableProps> = ({ logs, error }) => {
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "desc",
  );

  const sortedLogs = React.useMemo(() => {
    const isValidTimestamp = (ts?: string) =>
      !!ts && ts !== "0001-01-01T00:00:00Z";

    return [...logs].sort((a, b) => {
      const aValid = isValidTimestamp(a.execution_timestamp);
      const bValid = isValidTimestamp(b.execution_timestamp);

      if (aValid && bValid) {
        const aTime = new Date(a.execution_timestamp).getTime();
        const bTime = new Date(b.execution_timestamp).getTime();
        if (bTime !== aTime)
          return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
        // tie-breaker on task number based on sort direction for consistency
        return sortDirection === "asc"
          ? a.task_number - b.task_number
          : b.task_number - a.task_number;
      }
      if (aValid && !bValid) return -1; // valid timestamps first
      if (!aValid && bValid) return 1;
      // both invalid -> fall back to task number
      return sortDirection === "asc"
        ? a.task_number - b.task_number
        : b.task_number - a.task_number;
    });
  }, [logs, sortDirection]);

  // Show all logs if 11 or more, otherwise limit to 10
  const shouldShowAll = sortedLogs.length >= 11;
  const displayLogs = shouldShowAll ? sortedLogs : sortedLogs.slice(0, 10);
  const shouldScroll = sortedLogs.length > 10;

  return (
    <>
      {/* Desktop/tablet view */}

      <Typography variant="h2" color="white" align="left" className=" m-4">
        Job Logs
      </Typography>
      <div
        className={`hidden md:block w-full overflow-x-auto ${shouldScroll ? " max-h-[600px] overflow-y-auto" : ""}`}
        style={shouldScroll ? { maxHeight: 700 } : {}}
      >
        <Table className={``}>
          <TableHeader className="sticky">
            <TableRow className="whitespace-nowrap">
              <TableHead>Task Number</TableHead>
              <TableHead>Tx Hash</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() =>
                  setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
                }
              >
                <div className="flex items-center gap-1">
                  <span>Timestamp</span>
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform ${
                      sortDirection === "asc" ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Operation Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-red-400">
                  {error}
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No logs found.
                </TableCell>
              </TableRow>
            ) : (
              displayLogs.map((log) => {
                const hasValidTimestamp =
                  !!log.execution_timestamp &&
                  log.execution_timestamp !== "0001-01-01T00:00:00Z";

                const hasStatusText = !!(
                  log.task_status && log.task_status.trim() !== ""
                );

                return (
                  <TableRow
                    key={`${log.task_id}-${log.task_number}`}
                    className="group"
                  >
                    <TableCell
                      className={`border-l-4 px-6 py-4 ${
                        log.is_successful
                          ? "border-green-500"
                          : "border-red-500"
                      }`}
                    >
                      <Typography variant="body" color="primary" align="left">
                        {log.task_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {log.tx_url && log.execution_tx_hash ? (
                        <div className="flex items-center gap-2">
                          <Typography
                            variant="body"
                            color="primary"
                            align="left"
                          >
                            <a
                              href={log.tx_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline-offset-2 pt-1 hover:text-[#F8ff7c]/80 group-hover:text-[#F8ff7c] transition-colors"
                            >
                              {log.execution_tx_hash.slice(0, 8)}...
                              {log.execution_tx_hash.slice(-6)}
                            </a>
                          </Typography>
                          <ExternalLink className="inline w-4 h-4 align-middle group-hover:text-[#F8ff7c] transition-colors" />
                        </div>
                      ) : (
                        <Typography variant="body" color="gray" align="left">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body" color="primary" align="left">
                        {hasValidTimestamp
                          ? new Date(log.execution_timestamp).toLocaleString()
                          : "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {log.is_successful ? (
                        <span className="border border-green-400/10 bg-green-500/10 text-green-300 py-2 px-3 rounded-full">
                          {hasStatusText ? log.task_status : "Success"}
                        </span>
                      ) : (
                        <span className="border border-red-400/10 bg-red-500/10 text-red-300 py-2 px-3 rounded-full">
                          {hasStatusText ? log.task_status : "Failed"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="border border-[#C07AF6] bg-[#976fb93e] text-[#C07AF6]  py-1  text-center rounded-full ">
                        <Typography variant="body" color="blue" align="center">
                          {Number(log.task_opx_cost).toFixed(2)}
                        </Typography>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      {/* Mobile/card view */}
      <JobLogsMobileView logs={sortedLogs} error={error} />
    </>
  );
};

export { JobLogsMobileView };
export default JobLogsTable;
