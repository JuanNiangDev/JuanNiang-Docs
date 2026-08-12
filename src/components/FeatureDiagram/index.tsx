import type {JSX} from 'react';
import AgentDiagram from './AgentDiagram';
import ConcurrencyDiagram from './ConcurrencyDiagram';
import MemoryDiagram from './MemoryDiagram';
import PluginsDiagram from './PluginsDiagram';
import AdminDiagram from './AdminDiagram';
import ModulesDiagram from './ModulesDiagram';

export type FeatureDiagramVariant =
  | 'agent'
  | 'concurrency'
  | 'memory'
  | 'plugins'
  | 'admin'
  | 'modules';

export default function FeatureDiagram({variant}: {variant: FeatureDiagramVariant}): JSX.Element {
  switch (variant) {
    case 'agent': return <AgentDiagram />;
    case 'concurrency': return <ConcurrencyDiagram />;
    case 'memory': return <MemoryDiagram />;
    case 'plugins': return <PluginsDiagram />;
    case 'admin': return <AdminDiagram />;
    case 'modules': return <ModulesDiagram />;
    default: return <svg viewBox="0 0 240 138" />;
  }
}
