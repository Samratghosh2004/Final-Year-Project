# check_classes.py - run this once in your backend folder
from tensorflow.keras.preprocessing.image import ImageDataGenerator

datagen = ImageDataGenerator(rescale=1./255)
gen = datagen.flow_from_directory(
    'dataSet/trainingData',
    target_size=(128, 128),
    batch_size=1,
    color_mode='grayscale',
    class_mode='categorical'
)
# Sort by index value to see the order
sorted_classes = sorted(gen.class_indices.items(), key=lambda x: x[1])
print(sorted_classes)