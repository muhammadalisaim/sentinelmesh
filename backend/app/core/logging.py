import logging
import sys

def setup_logging():
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    # Suppress overly chatty loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

logger = logging.getLogger("sentinelmesh")
