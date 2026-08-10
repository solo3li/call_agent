import os
import logging
from dotenv import load_dotenv

from livekit.agents import AutoSubscribe, JobContext, JobProcess, WorkerOptions, cli, llm
from livekit.plugins import google, silero

load_dotenv()
logger = logging.getLogger("cpaas-agent")
logger.setLevel(logging.INFO)

def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()

async def entrypoint(ctx: JobContext):
    # This function is called automatically when a room is created
    logger.info(f"Connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Wait for the user participant to join
    participant = await ctx.wait_for_participant()
    logger.info(f"Started session with {participant.identity}")

    initial_ctx = llm.ChatContext().append(
        role="system",
        text=(
            "أنت مساعد افتراضي ذكي تتحدث اللغة العربية. "
            "أنت الآن في مكالمة هاتفية مع مستخدم. "
            "تحدث بشكل طبيعي ومختصر، كما لو كنت في مكالمة حقيقية. "
            "تجنب الإجابات الطويلة جداً واستخدم نبرة ودية."
        ),
    )

    agent = google.beta.MultimodalAgent(
        model="models/gemini-3.1-flash-live-preview",
        chat_ctx=initial_ctx,
    )
    
    agent.start(ctx.room, participant)
    
    # Send an initial greeting
    agent.generate_reply()

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        )
    )
