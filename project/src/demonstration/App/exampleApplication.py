from utils import BrowserManager
import time

website = 'http://173.255.226.26'
port    = 8080

game    = ""
tests   = "unitTesting"

gameDescriptor = "game"
testDescriptor = "testing"

browser = BrowserManager()

browser.AddBasePage(website)
browser.AddSubPage(gameDescriptor,game)
browser.AddSubPage(testDescriptor,tests)

browser.Load(gameDescriptor)
time.sleep(3)
browser.Load(testDescriptor)
