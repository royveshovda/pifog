from sense_hat import SenseHat

sense = SenseHat()

X = [255, 0, 0]  # Red
O = [255, 255, 255]  # White

question_mark_0 = [
O, O, O, X, X, O, O, O,
O, O, X, O, O, X, O, O,
O, O, O, O, O, X, O, O,
O, O, O, O, X, O, O, O,
O, O, O, X, O, O, O, O,
O, O, O, X, O, O, O, O,
O, O, O, O, O, O, O, O,
O, O, O, X, O, O, O, O
]

question_mark_90 = [
O, O, O, O, O, O, O, O,
O, O, O, O, O, O, O, O,
O, X, X, O, O, O, O, O,
X, O, O, X, O, O, O, O,
X, O, O, O, X, X, O, X,
O, X, O, O, O, O, O, O,
O, O, O, O, O, O, O, O,
O, O, O, O, O, O, O, O
]

question_mark_180 = [
O, O, O, O, X, O, O, O,
O, O, O, O, O, O, O, O,
O, O, O, O, X, O, O, O,
O, O, O, O, X, O, O, O,
O, O, O, X, O, O, O, O,
O, O, X, O, O, O, O, O,
O, O, X, O, O, X, O, O,
O, O, O, X, X, O, O, O
]

question_mark_270 = [
O, O, O, O, O, O, O, O,
O, O, O, O, O, O, O, O,
O, O, O, O, O, O, X, O,
X, O, X, X, O, O, O, X,
O, O, O, O, X, O, O, X,
O, O, O, O, O, X, X, O,
O, O, O, O, O, O, O, O,
O, O, O, O, O, O, O, O
]

sense.set_pixels(question_mark_270)