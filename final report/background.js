chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'fillCandidate') return;

  const tryFill = (tabId) => {
    fillCandidateInTab(tabId, message.candidate, message.selector, message.submitSelector)
      .then(result => sendResponse(result))
      .catch(err => sendResponse({ error: err?.message || String(err) }));
  };

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.id) {
      tryFill(tab.id);
      return;
    }

    chrome.tabs.query({ highlighted: true, currentWindow: true }, (tabs2) => {
      const tab2 = tabs2[0];
      if (tab2?.id) {
        tryFill(tab2.id);
      } else {
        sendResponse({ error: 'No active tab found.' });
      }
    });
  });

  return true;
});

async function fillCandidateInTab(tabId, candidate, selector, submitSelector) {
  if (!selector) {
    return { error: 'Target selector is required.' };
  }

  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (candidate, selector, submitSelector) => {
      const input = document.querySelector(selector);
      if (!input) return { error: 'Input not found.' };

      if ('value' in input) {
        input.focus();
        input.value = candidate;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const initialUrl = location.href;
      if (submitSelector) {
        const submitButton = document.querySelector(submitSelector);
        if (submitButton) {
          submitButton.click();
        }
      } else if (input.form) {
        try {
          input.form.requestSubmit?.();
        } catch (e) {
          input.form.submit?.();
        }
      }

      const checkResult = () => {
        const currentUrl = location.href;
        const stillHasInput = !!document.querySelector(selector);
        const success = currentUrl !== initialUrl || !stillHasInput;
        return { ok: true, success, candidate };
      };

      return new Promise((resolve) => {
        setTimeout(() => {
          const first = checkResult();
          if (first.success) {
            resolve(first);
            return;
          }
          setTimeout(() => resolve(checkResult()), 900);
        }, 400);
      });
    },
    args: [candidate, selector, submitSelector]
  });

  return result?.result || { error: 'No response from page.' };
}
