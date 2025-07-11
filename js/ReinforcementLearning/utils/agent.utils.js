export const clearExistingAgents = () => {
  const agents = document.querySelectorAll('.agent');
  for (let i = 0; i < agents.length; i++) {
    agents[i].remove();
  }
}
