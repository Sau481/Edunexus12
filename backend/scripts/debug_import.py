
import sys
import traceback

try:
    print("Attempting to import notebook_service...")
    from app.modules.chapter.notebook.service import notebook_service
    print("Import successful.")
except Exception:
    with open("import_error.txt", "w") as f:
        traceback.print_exc(file=f)
    print("Import failed. Details written to import_error.txt")
