import sys
from phate_io import run_phate

run_phate("test_10X.zip",
          sparse=None,
          gene_labels='symbol',
          allow_duplicates=False)

sys.stdout.write("OUT DATA TEST SUCESSFUL")
exit(1)
