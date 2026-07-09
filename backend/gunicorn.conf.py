import os
bind = f"0.0.0.0:{os.getenv('PORT', 5000)}"
workers = 1
worker_class = "gthread"
threads = 2
timeout = 60         
