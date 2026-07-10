from go_agent_python import GDAgent, GDAgentOptions, GDRunner, GDRunnerOptions
from go_agent_python.tools import create_goknowb_tool
from app.services.qnabot.prompts import SYSTEM_PROMPT

# Change kb_node_ids to target a specific KB once you have a node ID
_kb_tool = create_goknowb_tool(
    kb_node_ids=["/"],
    score_threshold=0.7,
    search_type="lexical_and_semantic",
)

_agent = GDAgent(GDAgentOptions(
    name="QNABot",
    model="gpt-5",
    instructions=SYSTEM_PROMPT,
    tools=[_kb_tool],
))


async def get_reply(query: str, session_id: str) -> str:
    runner = GDRunner(options=GDRunnerOptions(
        conversation_id=session_id,
    ))
    response = await runner.run_instance(_agent, [{"role": "user", "content": query}])
    return response if isinstance(response, str) else response.content
