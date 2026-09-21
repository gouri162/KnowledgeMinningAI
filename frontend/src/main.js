import { renderTopNav } from './components/topNav.js';
import { renderLeftSidebar } from './components/leftSidebar.js';
import { renderChatPanel } from './components/chatPanel.js';
import { renderDocumentsView } from './components/documentsView.js';
import { renderDocumentModal } from './components/documentModal.js';
import { showToast, showConfirmDialog, showPromptDialog } from './components/toast.js';
import { renderAllDiagrams } from './components/diagramRenderer.js';

// ── INITIAL CONSULTAI GREETING & NEW CONVERSATION GENERATOR ──
function createInitialGreetingMessage() {
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return {
    role: 'assistant',
    isGreeting: true,
    answer: 'Hello! This is ConsultAI, how can I help you?',
    explanation: 'ConsultAI is your AI intelligence assistant powered by Azure OpenAI and Supabase Vector Knowledge Base. How can I help you today?',
    timestamp: timeStr
  };
}

function createNewConversation(title = 'New Consultation') {
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return {
    id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: title,
    time: timeStr,
    messages: [createInitialGreetingMessage()]
  };
}

// Helper to safely load stored conversations
function loadSavedConversations() {
  try {
    const saved = localStorage.getItem('consultai_conversations');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading localStorage conversations:', e);
  }
  return [createNewConversation('New Consultation')];
}

// ── GLOBAL APPLICATION STATE ──
const state = {
  activeTab: 'chat', // 'chat' | 'documents'
  activeConvId: '',
  searchQuery: '',
  isStreaming: false,
  isUploadingDoc: false,
  workflowState: {
    status: 'Completed',
    total_duration: '1s'
  },
  referencedDocs: [],
  documentsList: [],
  conversations: loadSavedConversations(),
  docModal: {
    isOpen: false,
    filename: '',
    chunks_count: undefined,
    content: '',
    fullContent: '',
    isLoading: false,
    error: null
  }
};

// Ensure site ALWAYS opens on a fresh new chat with greeting
let freshConv = state.conversations.find(c => c.messages.filter(m => m.role === 'user').length === 0);
if (!freshConv) {
  freshConv = createNewConversation('New Consultation');
  state.conversations.unshift(freshConv);
}
state.activeConvId = freshConv.id;
state.activeTab = 'chat';

function persistConversations() {
  try {
    localStorage.setItem('consultai_conversations', JSON.stringify(state.conversations));
  } catch (e) {
    console.error('Failed to save conversations to localStorage:', e);
  }
}

// ── FETCH DOCUMENTS FROM SUPABASE (PERSISTENCE ON RELOAD) ──
async function fetchDocuments() {
  try {
    const res = await fetch('/api/documents');
    if (res.ok) {
      const docs = await res.json();
      state.documentsList = docs || [];
      // If we have documents and no referencedDocs yet, set the top document
      if (state.documentsList.length > 0 && state.referencedDocs.length === 0) {
        state.referencedDocs = state.documentsList.slice(0, 1).map(d => ({
          name: d.name,
          description: 'Available in knowledge base'
        }));
      }
    }
  } catch (err) {
    console.warn('Could not fetch documents from Supabase:', err);
  }
}

// ── OPEN DOCUMENT VIEWER MODAL ──
async function openDocumentViewer(docName) {
  if (!docName) return;

  state.docModal = {
    isOpen: true,
    filename: docName,
    chunks_count: undefined,
    content: '',
    fullContent: '',
    isLoading: true,
    error: null
  };
  renderApp();

  try {
    const res = await fetch(`/api/documents/${encodeURIComponent(docName)}/content`);
    if (!res.ok) {
      throw new Error(`Server returned error ${res.status}`);
    }
    const data = await res.json();
    state.docModal.isLoading = false;
    state.docModal.chunks_count = data.chunks_count;
    state.docModal.content = data.content || 'No text found.';
    state.docModal.fullContent = data.content || '';
  } catch (err) {
    console.error('Error fetching document content:', err);
    state.docModal.isLoading = false;
    state.docModal.error = `Failed to load document content: ${err.message}`;
  }
  renderApp();
}

function closeDocumentViewer() {
  state.docModal.isOpen = false;
  renderApp();
}

// ── UPLOAD PDF HANDLER (FOR DROPZONE AND CHAT ATTACH) ──
async function handlePdfUpload(file) {
  if (!file) return;
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    showToast({
      title: 'Invalid File Format',
      message: 'Only PDF documents are supported for knowledge base indexing.',
      type: 'warning'
    });
    return;
  }

  state.isUploadingDoc = true;
  renderApp();

  const dismissLoading = showToast({
    title: 'Indexing Document',
    message: `Uploading "${file.name}" and extracting vector embeddings...`,
    type: 'loading',
    duration: 0
  });

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Upload failed with status ${res.status}`);
    }

    const result = await res.json();
    await fetchDocuments();

    state.referencedDocs = [{
      name: file.name,
      description: 'Used for answer generation'
    }];

    dismissLoading();
    showToast({
      title: 'Document Indexed Successfully! 🎉',
      message: `"${file.name}" was indexed into Supabase with ${result.chunks_indexed || 1} vector chunks and is now ready for questioning.`,
      type: 'success',
      duration: 5000
    });
  } catch (err) {
    console.error('Upload error:', err);
    dismissLoading();
    showToast({
      title: 'Upload Failed',
      message: err.message || 'Could not process and index document.',
      type: 'error',
      duration: 6000
    });
  } finally {
    state.isUploadingDoc = false;
    renderApp();
  }
}

// ── DELETE SINGLE DOCUMENT HANDLER ──
async function handleDeleteDocument(docName) {
  if (!docName) return;

  showConfirmDialog({
    title: 'Delete Document',
    message: `Are you sure you want to remove "${docName}" and all its vector embeddings from Supabase?`,
    confirmText: 'Delete Document',
    cancelText: 'Cancel',
    isDanger: true,
    onConfirm: async () => {
      try {
        const res = await fetch(`/api/documents/${encodeURIComponent(docName)}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
          throw new Error(`Failed to delete document (${res.status})`);
        }
        await fetchDocuments();
        state.referencedDocs = state.referencedDocs.filter(d => d.name !== docName);
        renderApp();
        showToast({
          title: 'Document Removed',
          message: `"${docName}" was successfully deleted from Supabase.`,
          type: 'info'
        });
      } catch (err) {
        console.error('Delete document error:', err);
        showToast({
          title: 'Delete Error',
          message: `Could not delete document: ${err.message}`,
          type: 'error'
        });
      }
    }
  });
}

// ── PURGE ALL DOCUMENTS HANDLER ──
async function handlePurgeDocuments() {
  showConfirmDialog({
    title: 'Purge Entire Knowledge Base',
    message: 'Are you sure you want to PURGE ALL documents and vector embeddings from Supabase? This action is irreversible.',
    confirmText: 'Purge Everything',
    cancelText: 'Cancel',
    isDanger: true,
    onConfirm: async () => {
      try {
        const res = await fetch('/api/documents/purge', {
          method: 'DELETE'
        });
        if (!res.ok) {
          throw new Error(`Purge request failed (${res.status})`);
        }
        state.documentsList = [];
        state.referencedDocs = [];
        renderApp();
        showToast({
          title: 'Knowledge Base Purged',
          message: 'All documents and vector embeddings have been successfully cleared from Supabase.',
          type: 'info'
        });
      } catch (err) {
        console.error('Purge error:', err);
        showToast({
          title: 'Purge Error',
          message: `Failed to purge vector database: ${err.message}`,
          type: 'error'
        });
      }
    }
  });
}

// ── HELPER: BEST MATCHING CONVERSATION SEARCH ──
function findBestMatchingConversation(query, conversations) {
  if (!query || !conversations || conversations.length === 0) return null;
  const q = query.toLowerCase().trim();
  const qWords = q.split(/\s+/).filter(w => w.length > 0);

  let bestConv = null;
  let highestScore = -1;

  for (const conv of conversations) {
    const title = (conv.title || '').toLowerCase().trim();
    let score = 0;

    // 1. Exact match with title (case-insensitive)
    if (title === q) {
      score = 1000;
    } 
    // 2. Title starts with query
    else if (title.startsWith(q)) {
      score = 600 + Math.min(100, Math.floor((q.length / title.length) * 100));
    } 
    // 3. Title contains full query string
    else if (title.includes(q)) {
      score = 400 + Math.min(100, Math.floor((q.length / title.length) * 100));
    } 
    // 4. Word-by-word title matching
    else {
      let matchedCount = 0;
      for (const word of qWords) {
        if (title.includes(word)) {
          matchedCount++;
        }
      }
      if (matchedCount > 0) {
        score = 200 + (matchedCount / qWords.length) * 150;
      }
    }

    // 5. If title didn't match well or at all, search inside messages (content, answer, explanation)
    if (score < 200 && conv.messages && conv.messages.length > 0) {
      for (const m of conv.messages) {
        const text = `${m.content || ''} ${m.answer || ''} ${m.explanation || ''}`.toLowerCase();
        if (text.includes(q)) {
          score = Math.max(score, 100);
          break;
        } else {
          // Check if any query word appears in messages
          for (const word of qWords) {
            if (word.length > 2 && text.includes(word)) {
              score = Math.max(score, 50);
              break;
            }
          }
        }
      }
    }

    if (score > highestScore && score > 0) {
      highestScore = score;
      bestConv = conv;
    }
  }

  return bestConv;
}

// ── DOM MOUNT & RENDER FUNCTION ──
function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;

  const currentConv = state.conversations.find(c => c.id === state.activeConvId) || state.conversations[0];

  let mainContentHtml = '';

  if (state.activeTab === 'chat' || state.activeTab === 'home') {
    mainContentHtml = `
      <div class="workspace-columns full-chat-layout">
        ${renderChatPanel(currentConv ? currentConv.messages : [], state.isStreaming)}
      </div>
    `;
  } else if (state.activeTab === 'documents') {
    mainContentHtml = renderDocumentsView(state.documentsList, state.isUploadingDoc);
  }

  app.innerHTML = `
    ${renderLeftSidebar(state.conversations, state.activeConvId, state.activeTab)}
    <div class="app-main-content">
      ${renderTopNav(state.searchQuery)}
      <div class="app-body-container">
        ${mainContentHtml}
      </div>
    </div>
    ${renderDocumentModal(state.docModal)}
  `;

  attachEventListeners();
  renderAllDiagrams(app);
}

// ── EVENT LISTENERS ATTACHMENT ──
function attachEventListeners() {
  // 1. Sidebar Nav Tab Switching
  document.querySelectorAll('.sidebar-nav-item').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const tab = e.currentTarget.getAttribute('data-nav-tab');
      if (tab === 'chat') {
        const currentConv = state.conversations.find(c => c.id === state.activeConvId);
        const hasUserMsgs = currentConv && currentConv.messages.some(m => m.role === 'user');
        if (hasUserMsgs) {
          const newConv = createNewConversation('New Consultation');
          state.conversations.unshift(newConv);
          state.activeConvId = newConv.id;
          persistConversations();
        }
        state.activeTab = 'chat';
        renderApp();
        return;
      }
      if (tab && state.activeTab !== tab) {
        state.activeTab = tab;
        if (tab === 'documents') {
          await fetchDocuments();
        }
        renderApp();
      }
    });
  });

  // 3. Conversation row selection
  document.querySelectorAll('.conversation-row').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.btn-conv-dots') || e.target.closest('.conv-dropdown-menu')) {
        return;
      }
      const convId = row.getAttribute('data-conv-id');
      if (convId && state.activeConvId !== convId) {
        state.activeConvId = convId;
        state.activeTab = 'chat';
        renderApp();
      }
    });
  });

  // 4. 3-Dots Menu Button Toggle
  document.querySelectorAll('.btn-conv-dots').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dotsId = btn.getAttribute('data-dots-id');
      const menu = document.getElementById(`dropdown-${dotsId}`);
      
      document.querySelectorAll('.conv-dropdown-menu').forEach(m => {
        if (m !== menu) m.classList.remove('show');
      });

      if (menu) {
        menu.classList.toggle('show');
      }
    });
  });

  // 5. Rename Chat Action
  document.querySelectorAll('.dropdown-item-rename').forEach(renameBtn => {
    renameBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const convId = renameBtn.getAttribute('data-rename-conv-id');
      const conv = state.conversations.find(c => c.id === convId);
      if (!conv) return;

      document.querySelectorAll('.conv-dropdown-menu.show').forEach(m => m.classList.remove('show'));

      showPromptDialog({
        title: 'Rename Chat',
        message: 'Enter a new title for this conversation:',
        defaultValue: conv.title || '',
        placeholder: 'Chat title...',
        confirmText: 'Save',
        cancelText: 'Cancel',
        onConfirm: (newTitle) => {
          if (newTitle && newTitle.trim() && newTitle.trim() !== conv.title) {
            conv.title = newTitle.trim();
            persistConversations();
            renderApp();
            showToast({
              title: 'Chat Renamed',
              message: `Renamed to "${conv.title}"`,
              type: 'success',
              duration: 3000
            });
          }
        }
      });
    });
  });

  // 6. Delete Chat Click Action
  document.querySelectorAll('.dropdown-item-delete').forEach(delBtn => {
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const convIdToDelete = delBtn.getAttribute('data-delete-conv-id');
      if (!convIdToDelete) return;

      const idx = state.conversations.findIndex(c => c.id === convIdToDelete);
      if (idx !== -1) {
        state.conversations.splice(idx, 1);

        if (state.conversations.length === 0) {
          const fresh = createNewConversation('New Consultation');
          state.conversations.push(fresh);
          state.activeConvId = fresh.id;
        } else if (state.activeConvId === convIdToDelete) {
          const nextConv = state.conversations[Math.min(idx, state.conversations.length - 1)];
          state.activeConvId = nextConv.id;
        }

        persistConversations();
        renderApp();
      }
    });
  });

  // 6. Close 3-dots dropdown when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.conv-dropdown-menu.show').forEach(m => m.classList.remove('show'));
  });

  // 7. Chat submission handler
  const chatInput = document.getElementById('chat-user-input');
  const btnSend = document.getElementById('btn-send-message');

  const executeSendMessage = async (userText) => {
    const text = (userText || (chatInput ? chatInput.value : '')).trim();
    if (!text || state.isStreaming) return;

    let currentConv = state.conversations.find(c => c.id === state.activeConvId);
    if (!currentConv) {
      currentConv = state.conversations[0];
      state.activeConvId = currentConv.id;
    }

    if (currentConv.messages.filter(m => m.role === 'user').length === 0) {
      currentConv.title = text.length > 26 ? text.substring(0, 26) + '…' : text;
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    currentConv.messages.push({
      role: 'user',
      content: text,
      timestamp: timeStr
    });

    if (chatInput) chatInput.value = '';
    state.isStreaming = true;
    persistConversations();
    renderApp();

    try {
      const historyPayload = currentConv.messages
        .filter(m => !m.isGreeting)
        .slice(-8)
        .map(m => ({
          role: m.role,
          content: m.role === 'assistant' ? `${m.answer || ''}\n${m.explanation || ''}`.trim() : (m.content || ''),
          answer: m.answer,
        explanation: m.explanation
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: currentConv.id,
          message: text,
          history: historyPayload
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      currentConv.messages.push({
        role: 'assistant',
        answer: data.answer,
        explanation: data.explanation,
        sources: data.sources || [],
        duration: data.duration || '2s',
        timestamp: data.timestamp || timeStr
      });

      if (data.sources && data.sources.length > 0) {
        state.referencedDocs = data.sources;
      } else {
        state.referencedDocs = [];
      }
      if (data.duration) {
        state.workflowState.total_duration = data.duration;
      }
    } catch (err) {
      console.error("Chat error:", err);
      currentConv.messages.push({
        role: 'assistant',
        answer: `Direct response generated for your query.`,
        explanation: `We encountered a communication delay with the backend API. Please verify the server is active at port 8000. You can click 'Regenerate' below to retry.`,
        sources: [],
        duration: '1s',
        timestamp: timeStr
      });
    } finally {
      state.isStreaming = false;
      persistConversations();
      renderApp();
    }
  };

  if (btnSend && chatInput) {
    btnSend.addEventListener('click', () => executeSendMessage());
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeSendMessage();
      }
    });
  }

  // 8. Quick suggestion chips click
  document.querySelectorAll('.quick-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const promptText = e.currentTarget.getAttribute('data-prompt');
      if (promptText) {
        executeSendMessage(promptText);
      }
    });
  });

  // 9. Banner feature cards click
  document.querySelectorAll('.banner-feature-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const promptText = e.currentTarget.getAttribute('data-prompt');
      if (promptText) {
        executeSendMessage(promptText);
      }
    });
  });

  // 10. Regenerate response buttons (attached to all assistant message cards)
  document.querySelectorAll('.btn-regenerate').forEach(btnRegen => {
    btnRegen.addEventListener('click', async (e) => {
      if (state.isStreaming) return;

      const currentConv = state.conversations.find(c => c.id === state.activeConvId);
      if (!currentConv || !currentConv.messages || currentConv.messages.length === 0) return;

      const idxStr = e.currentTarget.getAttribute('data-msg-idx');
      let targetIdx = idxStr !== null && idxStr !== undefined ? parseInt(idxStr, 10) : -1;

      // Find the target assistant message index
      if (isNaN(targetIdx) || targetIdx < 0 || targetIdx >= currentConv.messages.length) {
        for (let i = currentConv.messages.length - 1; i >= 0; i--) {
          if (currentConv.messages[i].role === 'assistant' && !currentConv.messages[i].isGreeting) {
            targetIdx = i;
            break;
          }
        }
      }

      // Find the user query that preceded this assistant response
      let userQuery = '';
      for (let i = targetIdx - 1; i >= 0; i--) {
        if (currentConv.messages[i].role === 'user') {
          userQuery = currentConv.messages[i].content;
          break;
        }
      }

      // If not found, find any last user message
      if (!userQuery) {
        const lastUserMsg = [...currentConv.messages].reverse().find(m => m.role === 'user');
        if (lastUserMsg) userQuery = lastUserMsg.content;
      }

      if (!userQuery) return;

      // Remove the assistant message that is being regenerated (so it gets replaced)
      if (targetIdx >= 0 && targetIdx < currentConv.messages.length) {
        currentConv.messages.splice(targetIdx, 1);
      }

      state.isStreaming = true;
      persistConversations();
      renderApp();

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      try {
        const historyPayload = currentConv.messages
          .filter(m => !m.isGreeting)
          .slice(-8)
          .map(m => ({
            role: m.role,
            content: m.role === 'assistant' ? `${m.answer || ''}\n${m.explanation || ''}`.trim() : (m.content || ''),
            answer: m.answer,
            explanation: m.explanation
          }));

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: currentConv.id,
            message: userQuery,
            history: historyPayload
          })
        });

        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}`);
        }

        const data = await res.json();
        currentConv.messages.push({
          role: 'assistant',
          answer: data.answer,
          explanation: data.explanation,
          sources: data.sources || [],
          duration: data.duration || '2s',
          timestamp: data.timestamp || timeStr
        });

        if (data.sources && data.sources.length > 0) {
          state.referencedDocs = data.sources;
        } else {
          state.referencedDocs = [];
        }
        if (data.duration) {
          state.workflowState.total_duration = data.duration;
        }
      } catch (err) {
        console.error("Regenerate error:", err);
        currentConv.messages.push({
          role: 'assistant',
          answer: `Direct response generated for your query.`,
          explanation: `We encountered an issue regenerating this response. Please verify backend connectivity.`,
          sources: [],
          duration: '1s',
          timestamp: timeStr
        });
      } finally {
        state.isStreaming = false;
        persistConversations();
        renderApp();
      }
    });
  });

  // Action button icons dictionary
  const ACTION_ICONS = {
    copy: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
    check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    likeOutline: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>`,
    likeFilled: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>`,
    dislikeOutline: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>`,
    dislikeFilled: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>`
  };

  // 11. Copy answer button: switches to tick icon and reverts
  document.querySelectorAll('.btn-copy').forEach(copyBtn => {
    copyBtn.addEventListener('click', (e) => {
      const copyText = e.currentTarget.getAttribute('data-copy-text');
      if (copyText) {
        navigator.clipboard.writeText(copyText);
        copyBtn.innerHTML = ACTION_ICONS.check;
        copyBtn.classList.add('copied');
        copyBtn.setAttribute('title', 'Copied!');
        setTimeout(() => {
          copyBtn.innerHTML = ACTION_ICONS.copy;
          copyBtn.classList.remove('copied');
          copyBtn.setAttribute('title', 'Copy');
        }, 2000);
      }
    });
  });

  // 11b. Copy code block button
  document.querySelectorAll('.btn-copy-code').forEach(codeCopyBtn => {
    codeCopyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const code = decodeURIComponent(codeCopyBtn.getAttribute('data-code') || '');
      if (code) {
        navigator.clipboard.writeText(code);
        const orig = codeCopyBtn.textContent;
        codeCopyBtn.textContent = '✓ Copied';
        codeCopyBtn.classList.add('copied');
        setTimeout(() => {
          codeCopyBtn.textContent = orig;
          codeCopyBtn.classList.remove('copied');
        }, 2000);
      }
    });
  });

  // 12. Like / Dislike buttons: switch between outline and filled icon with mutual exclusivity
  document.querySelectorAll('.assistant-actions-left').forEach(actionsWrap => {
    const likeBtn = actionsWrap.querySelector('.btn-like');
    const dislikeBtn = actionsWrap.querySelector('.btn-dislike');

    if (likeBtn) {
      likeBtn.addEventListener('click', () => {
        const isCurrentlyActive = likeBtn.classList.contains('active');
        if (isCurrentlyActive) {
          likeBtn.classList.remove('active');
          likeBtn.innerHTML = ACTION_ICONS.likeOutline;
          likeBtn.setAttribute('title', 'Helpful');
        } else {
          likeBtn.classList.add('active');
          likeBtn.innerHTML = ACTION_ICONS.likeFilled;
          likeBtn.setAttribute('title', 'Marked as helpful');
          if (dislikeBtn) {
            dislikeBtn.classList.remove('active');
            dislikeBtn.innerHTML = ACTION_ICONS.dislikeOutline;
            dislikeBtn.setAttribute('title', 'Not helpful');
          }
        }
      });
    }

    if (dislikeBtn) {
      dislikeBtn.addEventListener('click', () => {
        const isCurrentlyActive = dislikeBtn.classList.contains('active');
        if (isCurrentlyActive) {
          dislikeBtn.classList.remove('active');
          dislikeBtn.innerHTML = ACTION_ICONS.dislikeOutline;
          dislikeBtn.setAttribute('title', 'Not helpful');
        } else {
          dislikeBtn.classList.add('active');
          dislikeBtn.innerHTML = ACTION_ICONS.dislikeFilled;
          dislikeBtn.setAttribute('title', 'Marked as not helpful');
          if (likeBtn) {
            likeBtn.classList.remove('active');
            likeBtn.innerHTML = ACTION_ICONS.likeOutline;
            likeBtn.setAttribute('title', 'Helpful');
          }
        }
      });
    }
  });

  // 13. PDF File upload attachment in Chat input
  const btnAttach = document.getElementById('btn-attach-doc');
  const filePicker = document.getElementById('pdf-file-picker');
  if (btnAttach && filePicker) {
    btnAttach.addEventListener('click', () => filePicker.click());
    filePicker.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handlePdfUpload(file);
      e.target.value = '';
    });
  }

  // 14. Documents Tab: Top Dropzone Click & Drag/Drop
  const dropzone = document.getElementById('docs-tab-dropzone');
  const docsTabFileInput = document.getElementById('docs-tab-file-input');
  if (dropzone && docsTabFileInput) {
    dropzone.addEventListener('click', (e) => {
      if (e.target !== docsTabFileInput) {
        docsTabFileInput.click();
      }
    });

    docsTabFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handlePdfUpload(file);
      e.target.value = '';
    });

    // Drag & Drop
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });
    dropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handlePdfUpload(e.dataTransfer.files[0]);
      }
    });
  }

  // 15. Document Open / View Click Listeners (both in documents view and workflow panel)
  document.querySelectorAll('.btn-view-doc').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const docName = btn.getAttribute('data-doc-name');
      if (docName) {
        openDocumentViewer(docName);
      }
    });
  });

  // 16. Document Single Delete Click Listeners
  document.querySelectorAll('.btn-delete-single-doc').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const docName = btn.getAttribute('data-doc-name');
      if (docName) {
        handleDeleteDocument(docName);
      }
    });
  });

  // 17. Purge Vector Store Button
  const btnPurge = document.getElementById('btn-purge-vector');
  if (btnPurge) {
    btnPurge.addEventListener('click', (e) => {
      e.preventDefault();
      handlePurgeDocuments();
    });
  }

  // 18. Sync / Refresh Documents Button
  const btnRefreshDocs = document.getElementById('btn-refresh-docs');
  if (btnRefreshDocs) {
    btnRefreshDocs.addEventListener('click', async (e) => {
      e.preventDefault();
      await fetchDocuments();
      renderApp();
    });
  }

  // 19. Link "Knowledge Base ->" in workflowPanel
  const linkViewAll = document.getElementById('link-view-all-docs');
  if (linkViewAll) {
    linkViewAll.addEventListener('click', async (e) => {
      e.preventDefault();
      state.activeTab = 'documents';
      await fetchDocuments();
      renderApp();
    });
  }

  // 20. Document Modal Listeners (Close, Copy, Search)
  const modalClose = document.getElementById('btn-modal-close');
  const modalCloseFooter = document.getElementById('btn-modal-close-footer');
  const modalBackdrop = document.getElementById('doc-modal-backdrop');
  if (modalClose) modalClose.addEventListener('click', closeDocumentViewer);
  if (modalCloseFooter) modalCloseFooter.addEventListener('click', closeDocumentViewer);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeDocumentViewer();
    });
  }

  const modalCopy = document.getElementById('btn-modal-copy-text');
  if (modalCopy && state.docModal.content) {
    modalCopy.addEventListener('click', () => {
      navigator.clipboard.writeText(state.docModal.content);
      modalCopy.style.color = '#10B981';
      modalCopy.innerHTML = `<span>Copied!</span>`;
      setTimeout(() => {
        modalCopy.style.color = '';
        modalCopy.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Copy Text</span>
        `;
      }, 1500);
    });
  }

  const modalFilter = document.getElementById('doc-modal-filter-input');
  const modalTextEl = document.getElementById('doc-modal-text-content');
  if (modalFilter && modalTextEl) {
    modalFilter.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const rawText = state.docModal.fullContent || '';
      if (!q) {
        modalTextEl.textContent = rawText;
        return;
      }
      // Highlight matches safely
      const parts = rawText.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
      modalTextEl.innerHTML = parts.map(part => {
        if (part.toLowerCase() === q) {
          return `<mark style="background:#FEF08A;color:#854D0E;padding:0.1rem 0.2rem;border-radius:2px;">${part}</mark>`;
        }
        return part.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }).join('');
    });
  }

  // 21. Global search bar in top header: search chats & messages in real time
  const searchInput = document.getElementById('global-search-input');
  if (searchInput) {
    const applySearchFilter = (rawText) => {
      const query = (rawText || '').toLowerCase().trim();

      // Filter conversation rows in sidebar by title and messages
      document.querySelectorAll('.conversation-row').forEach(row => {
        if (!query) {
          row.style.display = 'flex';
          return;
        }
        const convId = row.getAttribute('data-conv-id');
        const conv = state.conversations.find(c => c.id === convId);
        const titleMatch = conv?.title?.toLowerCase().includes(query);
        const messageMatch = conv?.messages?.some(m =>
          (m.content && m.content.toLowerCase().includes(query)) ||
          (m.answer && m.answer.toLowerCase().includes(query)) ||
          (m.explanation && m.explanation.toLowerCase().includes(query))
        );
        row.style.display = (titleMatch || messageMatch) ? 'flex' : 'none';
      });
    };

    // Apply filter immediately if query exists from previous render
    if (state.searchQuery) {
      applySearchFilter(state.searchQuery);
    }

    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      applySearchFilter(state.searchQuery);
    });

    // Enter key: jump directly to the most matching chat
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const rawQuery = searchInput.value.trim();
        if (!rawQuery) return;

        const matchedConv = findBestMatchingConversation(rawQuery, state.conversations);
        if (matchedConv) {
          state.activeConvId = matchedConv.id;
          state.activeTab = 'chat';
          state.searchQuery = ''; // Reset search filter so all chats are visible and font is untouched
          renderApp();
          showToast({
            title: 'Chat Found',
            message: `Switched to "${matchedConv.title}"`,
            type: 'info',
            duration: 2500
          });
          setTimeout(() => {
            const activeRow = document.querySelector(`.conversation-row[data-conv-id="${matchedConv.id}"]`);
            if (activeRow) {
              activeRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 60);
        } else {
          showToast({
            title: 'No Matching Chat',
            message: `No chats found matching "${rawQuery}"`,
            type: 'warning',
            duration: 2500
          });
        }
      } else if (e.key === 'Escape') {
        state.searchQuery = '';
        searchInput.value = '';
        applySearchFilter('');
        searchInput.blur();
      }
    });
  }

  // 22. Reset all conversations button
  const btnReset = document.getElementById('btn-reset-data');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      showConfirmDialog({
        title: 'Start Fresh Conversation',
        message: 'Are you sure you want to reset and start a fresh new conversation?',
        confirmText: 'Start New',
        cancelText: 'Cancel',
        onConfirm: () => {
          localStorage.removeItem('consultai_conversations');
          const fresh = createNewConversation('New Consultation');
          state.conversations = [fresh];
          state.activeConvId = fresh.id;
          state.activeTab = 'chat';
          renderApp();
          showToast({
            title: 'New Conversation Started',
            message: 'All previous local chats reset.',
            type: 'info'
          });
        }
      });
    });
  }

  // Scroll chat messages to bottom
  const container = document.getElementById('chat-messages-container');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

// Global keydown for Escape to close modal
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.docModal.isOpen) {
    closeDocumentViewer();
  }
});

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', async () => {
  await fetchDocuments();
  renderApp();
});
