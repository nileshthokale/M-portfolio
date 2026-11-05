// Lightweight event dispatcher so components like Navbar do not statically bundle AgentSwarm
export function cancelAgentSwarm() {
  if (typeof window !== 'undefined') {
    document.documentElement.classList.remove('agent-swarm-active');
    window.dispatchEvent(new CustomEvent('cancel-agent-swarm'));
  }
}

