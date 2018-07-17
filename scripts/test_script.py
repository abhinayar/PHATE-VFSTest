import sys
from phate_io import run_phate, extract_gene_data

run_phate("test_10X.zip",
          sparse=None,
          gene_labels='symbol',
          allow_duplicates=False,
          min_library_size=10,
          min_cells_per_gene=2,
          operator_filename="operator.pickle",
          pca_filename="pca.pickle",
          coords_filename="phate.mat")

extract_gene_data(gene_id=15,
                  pca_filename="pca.pickle",
                  color_filename="color.mat")

sys.stdout.write("OUT DATA TEST SUCCESSFUL")

exit(1)
