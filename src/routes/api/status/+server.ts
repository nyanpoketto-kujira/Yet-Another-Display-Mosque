import { json } from '@sveltejs/kit';
import os from 'os';

export const GET = () => {
	const totalMem = os.totalmem();
	const freeMem = os.freemem();
	const usedMem = totalMem - freeMem;

	return json({
		platform: os.platform(),
		arch: os.arch(),
		cpus: os.cpus().length,
		loadAvg: os.loadavg(),
		memory: {
			total: totalMem,
			free: freeMem,
			used: usedMem,
			usagePercent: Math.round((usedMem / totalMem) * 100)
		},
		processUptime: Math.floor(process.uptime()),
		heap: process.memoryUsage().heapUsed
	});
};
