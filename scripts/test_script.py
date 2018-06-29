import sys
from phate_io import run_phate
import os

os.system("pip install --user scprep phate")

run_phate("../spoof_uploads/test_10X",
          sparse=None,
          gene_labels='symbol',
          allow_duplicates=False)
sys.stdout.write("OUT DATA TEST SUCESSFUL")
exit(1)
