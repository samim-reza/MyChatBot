class FlipbookManager {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 0;
        this.isBookOpen = false;
        this.pageMapping = {}; // To store page ID to page number mapping
        this.init();
    }

    init() {
        this.loadContent();
        this.initializeFlipbook();
        this.bindEvents();
    }

    loadContent() {
        const flipbook = $('#flipbook');

        // Add introduction page
        flipbook.append(this.createIntroPage());

        let pageIndex = 1; // Start from 1 (intro page is 0)

        // Add subhe section first
        if (writingsData.subhe) {
            writingsData.subhe.forEach(subhe => {
                pageIndex++;
                this.pageMapping[subhe.id] = pageIndex;
                flipbook.append(this.createContentPage(subhe, 'subhe'));
            });
        }

        // Add desert section
        if (writingsData.desert) {
            writingsData.desert.forEach(desert => {
                pageIndex++;
                this.pageMapping[desert.id] = pageIndex;
                flipbook.append(this.createContentPage(desert, 'desert'));
            });
        }

        // Add ishi section
        if (writingsData.ishi) {
            writingsData.ishi.forEach(ishi => {
                pageIndex++;
                this.pageMapping[ishi.id] = pageIndex;
                flipbook.append(this.createContentPage(ishi, 'ishi'));
            });
        }

        // Add scenes section
        writingsData.scenes.forEach(scene => {
            pageIndex++;
            this.pageMapping[scene.id] = pageIndex;
            flipbook.append(this.createContentPage(scene, 'scene'));
        });

        // Add poems section last
        writingsData.poems.forEach(poem => {
            pageIndex++;
            this.pageMapping[poem.id] = pageIndex;
            flipbook.append(this.createContentPage(poem, 'poem'));
        });

        this.totalPages = flipbook.children().length;
    }

    createIntroPage() {
        return `
            <div class="book-page intro-page">
                <div class="intro-content">
                    <h1>আমার লেখালেখি</h1>
                    <p>কবিতা এবং দৃশ্যকল্প</p>
                    <div class="intro-text">
                        <p>কথা বলার কিছু ব্যর্থ চেষ্টা</p>
                        <p>পাতা উল্টে পড়তে পারেন, ঘুরে দেখতে পারেন এক কথার জগত</p>
                    </div>
                </div>
            </div>
        `;
    }

    createContentPage(item, type) {
        return `
            <div id="${item.id}" class="writing-item scene-item">
                <h2 class="writing-title">${item.title}</h2>
                <div class="writing-date">${item.date}</div>
                <div class="writing-content">
                    ${item.content}
                </div>
            </div>
        `;
    }

    initializeFlipbook() {
        // Responsive width/height
        let width = 922, height = 600;
        if (window.innerWidth < 600) {
            width = window.innerWidth - 10;
            height = 260;
        } else if (window.innerWidth < 900) {
            width = 700;
            height = 400;
        } else if (window.innerWidth < 1200) {
            width = 700;
            height = 480;
        }

        $("#flipbook").turn({
            width: window.innerWidth < 768 ? window.innerWidth * 0.9 : 800,
            height: window.innerWidth < 768 ? 500 : 600,
            autoCenter: true,
            display: this.getDisplayMode(),
            acceleration: true,
            elevation: 50,
            gradients: true,
            when: {
                turning: (e, page, view) => this.onTurning(e, page, view),
                turned: (e, page, view) => this.onTurned(e, page, view)
            }
        });

        // Hide flipbook initially
        $("#flipbook").hide();
        $(".page-nav-controls, .keyboard-hint, .page-corner-hint").hide();

        // Re-initialize on window resize for responsiveness
        $(window).off('resize.flipbook').on('resize.flipbook', () => {
            $("#flipbook").turn("size", 
                window.innerWidth < 768 ? window.innerWidth * 0.9 : 800,
                window.innerWidth < 768 ? 500 : 600
            );
            
            $("#flipbook").turn("display", this.getDisplayMode());
            $("#flipbook").turn("resize");
        });
    }

    bindEvents() {
        // Book cover click
        $("#book-cover").click(() => this.openBook());

        // Navigation buttons
        $("#next-btn").click(() => $("#flipbook").turn('next'));
        $("#prev-btn").click(() => $("#flipbook").turn('previous'));

        // Keyboard navigation
        $(document).keydown((e) => this.handleKeyboard(e));

        // Sidebar navigation - this is the key fix for direct navigation
        $(".index-list a").click((e) => this.handleSidebarClick(e));

        // Tab system
        $("#poem-tab").click(() => this.switchTab('poem'));
        $("#scene-tab").click(() => this.switchTab('scene'));

        // Add page corners after content is loaded
        setTimeout(() => this.addPageCorners(), 1000);
    }

    openBook() {
        $("#book-cover").addClass('open');
        setTimeout(() => {
            $("#book-cover").hide().remove();
            $("#flipbook").show();
            $(".page-nav-controls, .keyboard-hint, .page-corner-hint").fadeIn();
            $("#flipbook").turn('next');
            this.updateNavButtons();
            this.isBookOpen = true;

            setTimeout(() => {
                $(".keyboard-hint, .page-corner-hint").fadeOut(1000);
            }, 5000);
        }, 800);
    }

    onTurning(e, page, view) {
        const pageId = $(e.target).turn('view')[0];
        if (pageId > 0) {
            const activePage = $(e.target).children().eq(pageId - 1).attr('id');
            this.highlightActivePage(activePage);
        }
    }

    onTurned(e, page, view) {
        this.currentPage = page;
        this.updateNavButtons();
    }

    handleKeyboard(e) {
        if ($("#flipbook").is(":visible")) {
            if (e.keyCode == 37) { // Left arrow
                $("#flipbook").turn('previous');
                return false;
            } else if (e.keyCode == 39) { // Right arrow
                $("#flipbook").turn('next');
                return false;
            }
        }
    }

    handleSidebarClick(e) {
        e.preventDefault();
        const pageId = $(e.target).data('page');

        // If book is not open yet, open it first then navigate
        if (!this.isBookOpen) {
            this.openBook();
            // Wait for book to open then navigate
            setTimeout(() => {
                this.goToPage(pageId);
            }, 1000);
        } else {
            this.goToPage(pageId);
        }
    }

    switchTab(tabType) {
        if (tabType === 'poem') {
            $("#poem-list").show();
            $("#scene-list").hide();
            $("#poem-tab").addClass('active');
            $("#scene-tab").removeClass('active');
        } else {
            $("#poem-list").hide();
            $("#scene-list").show();
            $("#scene-tab").addClass('active');
            $("#poem-tab").removeClass('active');
        }
    }

    goToPage(pageId) {
        // Ensure book is visible
        $("#book-cover").hide();
        $("#flipbook").show();
        $(".page-nav-controls").fadeIn();

        // Find the page index (add 1 because turn.js uses 1-based indexing)
        const pageNumber = this.pageMapping[pageId];
        if (pageNumber) {
            $("#flipbook").turn('page', pageNumber);
            this.updateNavButtons();
            this.highlightActivePage(pageId);
        }
    }

    updateNavButtons() {
        const currentPage = $("#flipbook").turn('page');
        const totalPages = $("#flipbook").turn('pages');

        $("#prev-btn").prop('disabled', currentPage <= 1);
        $("#next-btn").prop('disabled', currentPage >= totalPages);
    }

    highlightActivePage(pageId) {
        $(".index-list a").removeClass('active');
        $(".index-list a[data-page='" + pageId + "']").addClass('active');
    }

    addPageCorners() {
        $("#flipbook").find(".book-page, .writing-item").each(function() {
            if (!$(this).find('.page-corner-right').length) {
                const cornerRight = $("<div class='page-corner page-corner-right'></div>");
                const cornerLeft = $("<div class='page-corner page-corner-left'></div>");
                $(this).append(cornerRight).append(cornerLeft);
            }
        });

        // Corner click events
        $(document).on("click", ".page-corner-right", (e) => {
            e.stopPropagation();
            $("#flipbook").turn('next');
        });

        $(document).on("click", ".page-corner-left", (e) => {
            e.stopPropagation();
            $("#flipbook").turn('previous');
        });
    }
    
    // Add this function to determine display mode based on screen size
    getDisplayMode() {
      return window.innerWidth < 768 ? 'single' : 'double';
    }
}

// Ensure the flipbook size is appropriate for the device
function getFlipbookDimensions() {
  if (window.innerWidth < 480) {
    // Very small screens
    return {
      width: Math.min(window.innerWidth * 0.95, 320),
      height: 450
    };
  } else if (window.innerWidth < 768) {
    // Regular mobile screens
    return {
      width: Math.min(window.innerWidth * 0.9, 500),
      height: 500
    };
  } else {
    // Larger screens
    return {
      width: 800,
      height: 600
    };
  }
}

// Initialize or update the flipbook with appropriate dimensions
function initOrUpdateFlipbook() {
  const dimensions = getFlipbookDimensions();
  
  if ($("#flipbook").turn("is")) {
    $("#flipbook").turn("size", dimensions.width, dimensions.height);
    $("#flipbook").turn("display", getDisplayMode());
    $("#flipbook").turn("resize");
  } else {
    $("#flipbook").turn({
      width: dimensions.width,
      height: dimensions.height,
      autoCenter: true,
      display: getDisplayMode(),
      acceleration: true,
      elevation: 50,
      gradients: true,
      when: {
        turning: function(event, page, view) {
          // Update page indicator
          updatePageIndicator(page, $("#flipbook").turn("pages"));
        }
      }
    });
  }
}

// Add this function to fix mobile scrolling issues

function enableMobileScrolling() {
  if (window.innerWidth <= 768) {
    // Apply these fixes after turn.js initializes and when pages are turned
    setTimeout(function() {
      // Make the turn.js pages scrollable
      $('.turn-page').css({
        'overflow-y': 'auto',
        'height': 'auto',
        'min-height': '100%'
      });
      
      // Enable touch scrolling
      $('.turn-page').attr('data-scroll', 'true');
      
      // Fix all page content
      $('.page-content').css({
        'overflow-y': 'auto',
        'max-height': 'none'
      });
      
      // Specific fix for poem pages which tend to be longer
      $('[data-page^="poem"]').parent().css({
        'overflow-y': 'auto',
        'max-height': 'none'
      });
    }, 100);
  }
}

// Initialize flipbook when document is ready
$(document).ready(() => {
    new FlipbookManager();

    // Sidebar toggle logic
    $("#poem-tab").off("click").on("click", function(e) {
        $("#poem-list").stop(true, true).slideToggle(200);
        $(this).toggleClass('active');
    });
    $("#scene-tab").off("click").on("click", function(e) {
        $("#scene-list").stop(true, true).slideToggle(200);
        $(this).toggleClass('active');
    });
    $("#desert-tab").off("click").on("click", function(e) {
        $("#desert-list").stop(true, true).slideToggle(200);
        $(this).toggleClass('active');
    });
    $("#subhe-tab").off("click").on("click", function(e) {
        $("#subhe-list").stop(true, true).slideToggle(200);
        $(this).toggleClass('active');
    });
    $("#ishi-tab").off("click").on("click", function(e) {
        $("#ishi-list").stop(true, true).slideToggle(200);
        $(this).toggleClass('active');
    });

    // Bengali digit formatter
    const bn = new Intl.NumberFormat('bn', { useGrouping: false });
    const toBn = n => bn.format(n);

    // Page number rendering logic
    function renderFooter(pageNum) {
        $("#page-footer").text("পাতা " + toBn(pageNum));
    }

    // Initial render
    renderFooter(1);

    // Listen for page turns from turn.js
    $("#flipbook").on("turned", function(event, page, view) {
        renderFooter(page);
    });

    // Also update on navigation button click
    $("#next-btn").click(function() {
        const page = $("#flipbook").turn('page');
        renderFooter(page);
    });
    $("#prev-btn").click(function() {
        const page = $("#flipbook").turn('page');
        renderFooter(page);
    });
    
    // Initialize with correct dimensions
    initOrUpdateFlipbook();
    
    // Handle window resize events more efficiently
    let resizeTimer;
    $(window).on('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        initOrUpdateFlipbook();
      }, 250);
    });
    
    // Ensure content is scrollable on touch devices
    if ('ontouchstart' in window) {
      $(document).on('touchmove', function(e) {
        const $target = $(e.target);
        // Allow scrolling within book pages and index
        if ($target.closest('.book-page, .index-list').length) {
          e.stopPropagation();
        }
      });
    }

    // Function to ensure proper scrolling behavior on mobile
    function setupMobileScrolling() {
      if (window.innerWidth <= 768) {
        // Fix for turn.js pages - allow scrolling within pages
        $('.turn-page').css({
          'overflow-y': 'auto',
          '-webkit-overflow-scrolling': 'touch'
        });
        
        // Ensure each book page can scroll
        $('.book-page').css({
          'overflow-y': 'auto',
          '-webkit-overflow-scrolling': 'touch'
        });
        
        // Special handling for poem pages which might have longer content
        $('[data-page^="poem"]').css({
          'overflow-y': 'auto',
          'max-height': 'none'
        });
      }
    }

    // Initial setup for mobile scrolling
    setupMobileScrolling();
    
    // Also run when pages are loaded or turned
    $('#flipbook').on('turned', function(event, page, view) {
      setupMobileScrolling();
    });
    
    // Run again on window resize
    $(window).on('resize', function() {
      setupMobileScrolling();
    });
    
    // Handle touch events better
    $(document).on('touchstart touchmove', function(e) {
      // Allow default scrolling behavior within scrollable elements
      if ($(e.target).closest('.book-page, .turn-page').length) {
        e.stopPropagation();
      }
    });

    // Call when flipbook is initialized
    $('#flipbook').on('turned', function(event, page, view) {
      enableMobileScrolling();
    });
    
    // Also run on page load
    enableMobileScrolling();
    
    // Reapply when window is resized
    $(window).on('resize', function() {
      enableMobileScrolling();
    });
    
    // Override turn.js touch handling to allow scrolling within pages
    $(document).on('touchmove', function(e) {
      if ($(e.target).closest('.turn-page, .page-content').length) {
        e.stopPropagation();
      }
    });
});