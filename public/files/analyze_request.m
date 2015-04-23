% Preprocess data to form review structure (each review is an element) and wordlist (all unique words across all reviews)
%
% Author: Geoffrey Newman
% Date: 4/23/2015

function [reviews, topLabels, bottomLabels] = analyze_request(request,varargin)

if nargin > 1
    reviews = varargin{1};
end

if ~exist('reviews','var')
    if exist('clothing_reviews.mat','file')
        load clothing_reviews.mat
    else
        [reviews, wordlist] = import_data('Clothing_&_Accessories.txt');
        save clothing_reviews reviews wordlist
    end
end

%% Find similarity between user string and products

requestWords = unique(regexp([lower(request) '.'], '[\s\.,;:-''"?!/()]+', 'split'));

if strcmp(requestWords{1},'')
    requestWords(1) = [];
end

requestTitle = [cell2mat(requestWords) '_'];

reviewSimilarity = zeros(size(reviews));

parfor ind = 1:length(reviews)
    reviewWords = unique(regexp([lower(reviews(ind).text) '.'], '[\s\.,;:-''"?!/()]+', 'split'));
    similarity = 0;
    for wordcheck = requestWords
        if any(strcmp(reviewWords,wordcheck))
            similarity = similarity + 1;
        end
    end
    reviewSimilarity(ind) = similarity;
end

%% Plot histogram over how many of the words each review contained

figure
histogram(reviewSimilarity);
set(gca,'yscale','log');
% set(gca,'xtick',[min(reviewSimilarity)-1:max(reviewSimilarity)]+.5);
% set(gca,'xticklabel',{[min(reviewSimilarity)-1:max(reviewSimilarity)]});
xlim([-1 max(reviewSimilarity)+1]);
set(gca,'xtick',[min(get(gca,'xtick')):max(get(gca,'xtick'))])
xlabel('Number of words matched to each review');
ylabel('Number of reviews');

box off
grid
title('Distribution of word matches','fontsize',15)

saveas(gcf,[requestTitle '_fig1.png'],'png');
savefig(gcf,[requestTitle '_fig1']);

%% Determine frequency of matches

[matchCount, reviewNum] = sort(reviewSimilarity,'descend');

titles = struct2cell(reviews);
titles = squeeze(titles(2,:,:));

% Get rid of weirdness to titles
titles = cellfun(@(x) strrep(x,'Amazon.com: ',''),titles,'uniformoutput',0);
titles = cellfun(@(x) strrep(x,'&#39;',''),titles,'uniformoutput',0);
titles = cellfun(@(x) strrep(x,'&Amp;',''),titles,'uniformoutput',0);
titles = cellfun(@(x) strrep(x,'&reg;',''),titles,'uniformoutput',0);
titles = cellfun(@(x) strrep(x,': Clothing',''),titles,'uniformoutput',0);

reviewCap = 300;

topTitles = titles(reviewNum(1:reviewCap));
bottomTitles = titles(reviewNum(end-reviewCap+1:end));

topId = cellfun(@sum,topTitles);
bottomId = cellfun(@sum,bottomTitles);

topOccurances = hist(topId, unique(topId));
bottomOccurances = hist(bottomId, unique(bottomId));

[topResults, topResultNum] = unique(topTitles);
[bottomResults, bottomResultNum] = unique(bottomTitles);

[top5, t5ind] = sort(topOccurances,'descend');
top5 = top5(1:5);

[bottom5, b5ind] = sort(bottomOccurances,'descend');
bottom5 = bottom5(1:5);

topLabels = topResults(t5ind(1:5));
bottomLabels = bottomResults(b5ind(1:5));

%% Plot 5 best and worst most occuring matches

figure
subplot('position',[0.1 0.1 .85 .7])
h = bar([1:5;1:5]',[top5;bottom5]'); 
colormap([0 .4 0; .4 0 0]);
% http://www.mathworks.com/matlabcentral/answers/129900-data-labels-above-bars-on-grouped-bar-plot#comment_250401
yb = cat(1, h.YData);
xb = bsxfun(@plus, h(1).XData, [h.XOffset]');
hold on;
textorder = [1:2:10, 2:2:10];
texth = text(xb(textorder),yb(textorder)-2, [topLabels; bottomLabels],'rotation', 45);
% Make top 5 have green text, bottom 5 have red text
for textn = 1:length(texth)
    texth(textn).Color = [1*mod(textorder(textn)+1,2),1*mod(textorder(textn),2),0];
    % set(texth(textn),'edgecolor','black');
    set(texth(textn),'fontweight','bold');
end
legendh = legend('Good matches','Poor matches','location','SouthEastOutside');
ylabel('Repeat occurances in the top 300 matches','fontsize',14);
xlabel('Ranking','fontsize',14);
% ylim([0 50])
box off
grid
set(gcf,'position',[582         364        1067         754]);
t = title('Number of times products were found in the top and bottom 300 search results','fontsize',16);

saveas(gcf,[requestTitle '_fig2.png'],'png');
savefig(gcf,[requestTitle '_fig2']);

end