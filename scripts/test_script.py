import sys
from phate_io import run_phate

run_phate("test_10X.zip",
          sparse=None,
          gene_labels='symbol',
          allow_duplicates=False,
          min_library_size=10,
          min_cells_per_gene=2)

sys.stdout.write("OUT DATA TEST SUCCESSFUL")

exit(1)
