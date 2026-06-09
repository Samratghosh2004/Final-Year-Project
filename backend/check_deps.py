"""
Quick verification script to check if all dependencies are installed
Run this before starting the application
"""

import sys
import importlib

def check_python_version():
    """Check Python version"""
    version = sys.version_info
    print(f"✓ Python {version.major}.{version.minor}.{version.micro}")
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("  ⚠️  Warning: Python 3.8+ is recommended")
        return False
    return True

def check_package(package_name, import_name=None):
    """Check if a package is installed"""
    if import_name is None:
        import_name = package_name
    
    try:
        module = importlib.import_module(import_name)
        version = getattr(module, '__version__', 'unknown')
        print(f"✓ {package_name} ({version})")
        return True
    except ImportError:
        print(f"✗ {package_name} - NOT INSTALLED")
        return False

def main():
    print("\n" + "="*50)
    print("Sign Language Recognition - Dependency Check")
    print("="*50 + "\n")
    
    print("Python Environment:")
    check_python_version()
    
    print("\nRequired Packages:")
    packages = [
        ("Flask", "flask"),
        ("Flask-CORS", "flask_cors"),
        ("TensorFlow", "tensorflow"),
        ("Keras", "keras"),
        ("NumPy", "numpy"),
        ("OpenCV", "cv2"),
        ("Pillow", "PIL"),
        ("Hunspell", "hunspell"),
    ]
    
    missing = []
    for package_name, import_name in packages:
        if not check_package(package_name, import_name):
            missing.append(package_name)
    
    if missing:
        print(f"\n⚠️  Missing packages: {', '.join(missing)}")
        print("\nInstall missing packages with:")
        print("  pip install -r requirements.txt")
        return False
    else:
        print("\n✓ All packages installed!")
        return True
    
    print("\n" + "="*50)
    print("Backend Setup: READY ✓")
    print("="*50 + "\n")

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
